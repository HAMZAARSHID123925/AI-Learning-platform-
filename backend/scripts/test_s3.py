import asyncio
import os
import uuid
import aiobotocore.session
from app.config import get_settings

async def test_s3():
    print("Testing S3...", flush=True)
    settings = get_settings()
    
    if settings.S3_ENDPOINT_URL and "localhost" in settings.S3_ENDPOINT_URL:
        print("S3 uses localhost MinIO. Object storage is NOT verified for real production.", flush=True)
    elif not settings.S3_ACCESS_KEY_ID:
        print("S3_ACCESS_KEY_ID missing. Object storage is NOT verified.", flush=True)
    else:
        print("Checking S3...", flush=True)

    try:
        session = aiobotocore.session.get_session()
        async with session.create_client(
            's3',
            aws_access_key_id=settings.S3_ACCESS_KEY_ID or 'minio_access_key',
            aws_secret_access_key=settings.S3_SECRET_ACCESS_KEY or 'minio_secret_key',
            region_name=settings.S3_REGION,
            endpoint_url=settings.S3_ENDPOINT_URL
        ) as s3:
            test_key = f"production-test/test-{uuid.uuid4()}.txt"
            test_body = b"hello world"
            
            await s3.put_object(Bucket=settings.S3_BUCKET_NAME, Key=test_key, Body=test_body)
            print(f"Uploaded object to {settings.S3_BUCKET_NAME}/{test_key}", flush=True)
            
            response = await s3.get_object(Bucket=settings.S3_BUCKET_NAME, Key=test_key)
            async with response['Body'] as stream:
                body = await stream.read()
            if body == test_body:
                print("Read back object successfully.", flush=True)
                print("OBJECT STORAGE: VERIFIED", flush=True)
            else:
                print("OBJECT STORAGE: PARTIAL", flush=True)
                
            # Cleanup
            await s3.delete_object(Bucket=settings.S3_BUCKET_NAME, Key=test_key)
            print("Cleaned up.", flush=True)
        
    except Exception as e:
        print(f"OBJECT STORAGE: NOT VERIFIED (Exception: {e})", flush=True)

if __name__ == "__main__":
    asyncio.run(test_s3())
