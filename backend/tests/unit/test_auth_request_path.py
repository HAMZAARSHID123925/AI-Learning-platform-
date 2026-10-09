"""Auth request-path security tests; no production DB/Redis mutations."""
from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock
import uuid
import pytest
from fastapi.security import HTTPAuthorizationCredentials
from redis.exceptions import ConnectionError as RedisConnectionError
from app.shared import dependencies as deps, redis_client
from app.shared.exceptions import TokenInvalidError, TokenExpiredError, TokenRevokedError, AccountSuspendedError

UID=uuid.UUID(int=1)

def credentials(token='valid'):
    return HTTPAuthorizationCredentials(scheme='Bearer',credentials=token)

def user(status='active'):
    return SimpleNamespace(id=UID,status=SimpleNamespace(value=status),grade=3,user_roles=[])

def database(value):
    result=MagicMock();result.scalar_one_or_none.return_value=value;result.unique.return_value=result
    return SimpleNamespace(execute=AsyncMock(return_value=result))

@pytest.mark.asyncio
async def test_auth_client_has_no_ping_or_mock_fallback(monkeypatch):
    client=SimpleNamespace(ping=AsyncMock())
    monkeypatch.setattr(redis_client,'get_redis_client',lambda:client)
    generator=redis_client.get_auth_redis()
    assert await anext(generator) is client
    client.ping.assert_not_awaited();await generator.aclose()

@pytest.mark.asyncio
async def test_auth_client_factory_failure_propagates(monkeypatch):
    def fail(): raise RuntimeError('Controlled pool failure')
    monkeypatch.setattr(redis_client,'get_redis_client',fail)
    with pytest.raises(RuntimeError):await anext(redis_client.get_auth_redis())

@pytest.mark.asyncio
@pytest.mark.parametrize('optional',[False,True])
async def test_valid_token_checks_revocation_once(monkeypatch,optional):
    monkeypatch.setattr(deps,'decode_access_token',lambda _:dict(sub=str(UID),jti='controlled'))
    value=user();db=database(value);redis=SimpleNamespace(exists=AsyncMock(return_value=0),ping=AsyncMock())
    fn=deps.get_optional_current_user if optional else deps.get_current_user
    assert await fn(credentials=credentials(),db=db,redis=redis) is value
    redis.exists.assert_awaited_once();redis.ping.assert_not_awaited();db.execute.assert_awaited_once()

@pytest.mark.asyncio
@pytest.mark.parametrize('optional',[False,True])
async def test_revoked_token_cannot_be_authenticated(monkeypatch,optional):
    monkeypatch.setattr(deps,'decode_access_token',lambda _:dict(sub=str(UID),jti='revoked'))
    db=database(user());redis=SimpleNamespace(exists=AsyncMock(return_value=1))
    if optional:assert await deps.get_optional_current_user(credentials=credentials(),db=db,redis=redis) is None
    else:
        with pytest.raises(TokenRevokedError):await deps.get_current_user(credentials=credentials(),db=db,redis=redis)
    db.execute.assert_not_awaited()

@pytest.mark.asyncio
@pytest.mark.parametrize('error',[TokenInvalidError,TokenExpiredError])
@pytest.mark.parametrize('optional',[False,True])
async def test_invalid_or_expired_token_never_reaches_identity_query(monkeypatch,error,optional):
    def fail(_):raise error()
    monkeypatch.setattr(deps,'decode_access_token',fail)
    db=database(user());redis=SimpleNamespace(exists=AsyncMock())
    if optional:assert await deps.get_optional_current_user(credentials=credentials(),db=db,redis=redis) is None
    else:
        with pytest.raises(error):await deps.get_current_user(credentials=credentials(),db=db,redis=redis)
    db.execute.assert_not_awaited();redis.exists.assert_not_awaited()

@pytest.mark.asyncio
@pytest.mark.parametrize('optional',[False,True])
@pytest.mark.parametrize('failure',[RedisConnectionError,ValueError])
async def test_redis_failure_is_fail_closed(monkeypatch,optional,failure):
    monkeypatch.setattr(deps,'decode_access_token',lambda _:dict(sub=str(UID),jti='controlled'))
    db=database(user());redis=SimpleNamespace(exists=AsyncMock(side_effect=failure('Controlled failure')))
    fn=deps.get_optional_current_user if optional else deps.get_current_user
    with pytest.raises(failure):await fn(credentials=credentials(),db=db,redis=redis)
    db.execute.assert_not_awaited()

@pytest.mark.asyncio
@pytest.mark.parametrize('optional',[False,True])
@pytest.mark.parametrize('failure',[RuntimeError,ValueError,KeyError])
async def test_database_failure_is_fail_closed(monkeypatch,optional,failure):
    monkeypatch.setattr(deps,'decode_access_token',lambda _:dict(sub=str(UID),jti='controlled'))
    db=SimpleNamespace(execute=AsyncMock(side_effect=failure('Controlled DB failure')))
    redis=SimpleNamespace(exists=AsyncMock(return_value=0))
    fn=deps.get_optional_current_user if optional else deps.get_current_user
    with pytest.raises(failure):await fn(credentials=credentials(),db=db,redis=redis)

@pytest.mark.asyncio
@pytest.mark.parametrize('optional',[False,True])
async def test_suspended_account_is_not_authenticated(monkeypatch,optional):
    monkeypatch.setattr(deps,'decode_access_token',lambda _:dict(sub=str(UID),jti='controlled'))
    db=database(user('suspended'));redis=SimpleNamespace(exists=AsyncMock(return_value=0))
    if optional:assert await deps.get_optional_current_user(credentials=credentials(),db=db,redis=redis) is None
    else:
        with pytest.raises(AccountSuspendedError):await deps.get_current_user(credentials=credentials(),db=db,redis=redis)

@pytest.mark.asyncio
async def test_readiness_keeps_explicit_ping(monkeypatch):
    client=SimpleNamespace(ping=AsyncMock())
    monkeypatch.setattr(redis_client,'_get_pool',lambda:object())
    monkeypatch.setattr(redis_client.redis,'Redis',lambda **_:client)
    generator=redis_client.get_redis();assert await anext(generator) is client
    client.ping.assert_awaited_once();await generator.aclose()


@pytest.mark.asyncio
async def test_real_rs256_expiry_and_signature_errors(monkeypatch):
    from app.shared import auth
    from cryptography.hazmat.primitives.asymmetric import rsa
    from cryptography.hazmat.primitives import serialization
    from jose import jwt
    import time
    key=rsa.generate_private_key(public_exponent=65537,key_size=2048)
    private=key.private_bytes(serialization.Encoding.PEM,serialization.PrivateFormat.PKCS8,serialization.NoEncryption()).decode()
    public=key.public_key().public_bytes(serialization.Encoding.PEM,serialization.PublicFormat.SubjectPublicKeyInfo).decode()
    monkeypatch.setattr(auth,'get_settings',lambda:SimpleNamespace(jwt_private_key=private,jwt_public_key=public,JWT_ALGORITHM='RS256'))
    db=database(user());redis=SimpleNamespace(exists=AsyncMock(return_value=0))
    expired=jwt.encode({'sub':str(UID),'jti':'expired','iat':int(time.time())-100,'exp':int(time.time())-1},private,algorithm='RS256')
    with pytest.raises(TokenExpiredError):await deps.get_current_user(credentials=credentials(expired),db=db,redis=redis)
    valid=jwt.encode({'sub':str(UID),'jti':'valid','exp':int(time.time())+100},private,algorithm='RS256')
    parts=valid.split('.');parts[1]=parts[1][:-1]+('A' if parts[1][-1]!='A' else 'B')
    with pytest.raises(TokenInvalidError):await deps.get_current_user(credentials=credentials('.'.join(parts)),db=db,redis=redis)
    db.execute.assert_not_awaited();redis.exists.assert_not_awaited()


@pytest.mark.asyncio
async def test_actual_logout_revokes_refresh_and_blocks_access_jti(monkeypatch):
    from app.modules.module1_auth.services import auth_service
    from app.config import get_settings
    stored=SimpleNamespace(revoked_at=None)
    db=database(stored)
    values={};deleted=[]
    class MemoryRedis:
        async def set(self,key,value,ex=None):values[key]=(value,ex)
        async def exists(self,key):return int(key in values)
        async def delete(self,key):deleted.append(key);values.pop(key,None)
    redis=MemoryRedis()
    monkeypatch.setattr(auth_service,'_write_audit_log',AsyncMock())
    await auth_service.logout_user(db=db,redis=redis,raw_refresh_token='fixture-refresh',current_jti='controlled',user_id=UID)
    assert stored.revoked_at is not None
    assert f'{get_settings().REDIS_KEY_PREFIX}:session:{UID}' in deleted
    blacklist=f'{get_settings().REDIS_KEY_PREFIX}:blacklist:jwt:controlled'
    assert values[blacklist][1]==get_settings().JWT_ACCESS_TOKEN_EXPIRE_MINUTES*60
    monkeypatch.setattr(deps,'decode_access_token',lambda _:dict(sub=str(UID),jti='controlled'))
    with pytest.raises(TokenRevokedError):await deps.get_current_user(credentials=credentials(),db=db,redis=redis)
    assert db.execute.await_count==1  # only refresh-token lookup; no identity read after logout


@pytest.mark.asyncio
@pytest.mark.parametrize('optional',[False,True])
@pytest.mark.parametrize('failure_source',['redis','db'])
async def test_infrastructure_failure_never_reaches_http_handler(monkeypatch,optional,failure_source):
    import httpx
    from fastapi import FastAPI,Depends
    from app.database import get_db
    monkeypatch.setattr(deps,'decode_access_token',lambda _:dict(sub=str(UID),jti='controlled'))
    db=database(user())
    redis=SimpleNamespace(exists=AsyncMock(return_value=0))
    if failure_source=='redis':redis.exists.side_effect=RedisConnectionError('Controlled failure')
    else:db.execute.side_effect=RuntimeError('Controlled failure')
    app=FastAPI();calls=[]
    app.dependency_overrides[get_db]=lambda:db
    app.dependency_overrides[redis_client.get_auth_redis]=lambda:redis
    dependency=deps.get_optional_current_user if optional else deps.get_current_user
    @app.get('/guarded')
    async def guarded(principal=Depends(dependency)):
        calls.append(principal);return {'access':'granted'}
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app,raise_app_exceptions=False),base_url='http://fixture') as client:
        response=await client.get('/guarded',headers={'Authorization':'Bearer controlled'})
        assert response.status_code==500 and calls==[]
