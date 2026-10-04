import asyncio
import os
import sys
from redis.asyncio import Redis

# Ensure environment vars or fallback to config
from app.config import get_settings
settings = get_settings()

async def test_valkey():
    print("Testing Valkey connectivity...", flush=True)
    redis_client = Redis.from_url(settings.REDIS_URL, decode_responses=True)
    
    try:
        # PING
        pong = await redis_client.ping()
        print(f"PING: {pong}", flush=True)
        
        stream_name = f"{settings.REDIS_KEY_PREFIX}:video_generation:jobs"
        group_name = "video_generators"
        
        # Ensure consumer group exists
        try:
            await redis_client.xgroup_create(stream_name, group_name, mkstream=True)
            print(f"Created consumer group: {group_name}", flush=True)
        except Exception as e:
            if "BUSYGROUP" in str(e):
                print(f"Consumer group {group_name} already exists.", flush=True)
            else:
                raise e
        
        # XADD
        msg_id = await redis_client.xadd(stream_name, {"job_id": "test-job-123", "action": "test"})
        print(f"XADD success, msg_id: {msg_id}", flush=True)
        
        # XREADGROUP
        messages = await redis_client.xreadgroup(
            groupname=group_name,
            consumername="test_worker",
            streams={stream_name: ">"},
            count=1,
            block=1000
        )
        print(f"XREADGROUP success, messages: {messages}", flush=True)
        
        # XACK
        if messages:
            for stream, msgs in messages:
                for msg_id_recv, data in msgs:
                    if data.get("job_id") == "test-job-123":
                        ack_count = await redis_client.xack(stream_name, group_name, msg_id_recv)
                        print(f"XACK success, count: {ack_count} for msg: {msg_id_recv}", flush=True)
        
    except Exception as e:
        print(f"Valkey Test Failed: {e}", flush=True)
    finally:
        await redis_client.close()

if __name__ == "__main__":
    asyncio.run(test_valkey())
