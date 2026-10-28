import math
import os
import re
import time

import jwt

from errors import ApiError
from users import find_public


def _settings():
    secret = os.getenv("JWT_SECRET", "")
    if not re.fullmatch(r"[0-9a-fA-F]{64}", secret):
        raise ValueError("JWT_SECRET에 새 난수로 생성한 64자리 16진수 키를 설정하세요.")
    issuer = os.getenv("JWT_ISSUER", "webservice-class")
    audience = os.getenv("JWT_AUDIENCE", "board-api")
    if not issuer.strip() or not audience.strip():
        raise ValueError("JWT_ISSUER와 JWT_AUDIENCE는 비어 있을 수 없습니다.")
    ttl = int(os.getenv("TOKEN_TTL", "90"))
    if ttl <= 0:
        raise ValueError("TOKEN_TTL은 양의 정수여야 합니다.")
    return bytes.fromhex(secret), issuer, audience, ttl


def issue_token(user):
    key, issuer, audience, ttl = _settings()
    return jwt.encode(
        {"sub": str(user["id"]), "exp": int(time.time()) + ttl,
         "iss": issuer, "aud": audience},
        key,
        algorithm="HS256",
    )


def current_user_id(request):
    authorization = request.headers.get("Authorization", "")
    match = re.fullmatch(r"Bearer +([^\s]+)", authorization, re.IGNORECASE)
    if not match:
        raise ApiError(401, "TOKEN_REQUIRED", "Bearer 토큰이 필요합니다.")

    key, issuer, audience, _ = _settings()
    try:
        # 만료는 다른 필수 클레임까지 확인한 뒤 구분합니다.
        claims = jwt.decode(
            match.group(1), key, algorithms=["HS256"],
            issuer=issuer, audience=audience,
            options={"require": ["sub", "exp", "iss", "aud"],
                     "verify_exp": False, "strict_aud": True},
        )
        subject = claims["sub"]
        expiration = claims["exp"]
        if not isinstance(subject, str) or not re.fullmatch(r"[1-9][0-9]*", subject):
            raise jwt.InvalidTokenError("Invalid subject")
        if (type(expiration) not in (int, float)
                or not math.isfinite(expiration)):
            raise jwt.InvalidTokenError("Invalid expiration")
        user_id = int(subject)
        if not find_public(user_id):
            raise jwt.InvalidTokenError("Unknown user")
    except (jwt.InvalidTokenError, ValueError, OverflowError):
        raise ApiError(401, "INVALID_TOKEN", "유효하지 않은 토큰입니다.") from None

    if expiration <= time.time():
        raise ApiError(401, "TOKEN_EXPIRED", "로그인 시간이 만료되었습니다. 다시 로그인하세요.")
    return user_id


def assert_owner(user_id, author_id):
    if user_id != author_id:
        raise ApiError(403, "FORBIDDEN", "본인이 작성한 글만 수정하거나 삭제할 수 있습니다.")
