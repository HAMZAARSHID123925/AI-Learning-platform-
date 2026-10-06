"""Bounded video-stage retries and safe diagnostics."""
import asyncio,re
class VideoPipelineError(RuntimeError):
    def __init__(self,code,message): self.code=code;super().__init__(message)
def safe_error(exc):
    value=str(exc)
    value=re.sub(r"https?://\S+|(?:postgres(?:ql)?|redis)://\S+", "[URL REDACTED]",value)
    value=re.sub(r"(?i)Bearer\s+\S+|sk-[A-Za-z0-9_*\-]+|(?:api[_-]?key|token|password|secret)\s*[:=]\s*[^\s,;]+","[CREDENTIAL REDACTED]",value)
    return value[:1600]
def is_transient(exc):
    if exc.__cause__ is not None and exc.__cause__ is not exc:
        return is_transient(exc.__cause__)
    status=getattr(exc,"status_code",None)
    response=getattr(exc,"response",None)
    if status is None and response is not None: status=getattr(response,"status_code",None)
    if isinstance(response,dict): status=response.get("ResponseMetadata",{}).get("HTTPStatusCode",status)
    if status is not None: return status in {408,409,429,500,502,503,504}
    return isinstance(exc,(TimeoutError,ConnectionError,OSError)) or type(exc).__name__ in {"APITimeoutError","APIConnectionError","RateLimitError","EndpointConnectionError","ConnectionClosedError","ReadTimeoutError","ConnectTimeoutError","ReadTimeout","ConnectTimeout","WriteTimeout","PoolTimeout","RemoteProtocolError"}
async def retry_transient(operation,attempts=3):
    for attempt in range(attempts):
        try: return await operation()
        except Exception as exc:
            if attempt+1==attempts or not is_transient(exc): raise
            await asyncio.sleep(min(4,2**attempt))
