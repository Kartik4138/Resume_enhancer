import json
import hashlib
from app.cache.redis import redis_client

CACHE_TTL = 3600

def generate_content_hash(text: str) -> str:
    return hashlib.md5(text.encode('utf-8')).hexdigest()

def make_score_key(user_id: str, resume_text: str, jd_text: str) -> str:
    resume_hash = generate_content_hash(resume_text)
    jd_hash = generate_content_hash(jd_text)
    
    return f"score:{user_id}:{resume_hash}:{jd_hash}"

def get_cached_score(key: str):
    data = redis_client.get(key)
    return json.loads(data) if data else None

def set_cached_score(key: str, value: dict):
    redis_client.setex(
        key,
        CACHE_TTL,
        json.dumps(value, default=str)
    )