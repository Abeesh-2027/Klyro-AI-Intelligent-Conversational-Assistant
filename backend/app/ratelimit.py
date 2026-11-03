import time
from collections import defaultdict, deque

from fastapi import HTTPException, Request


class RateLimit:
    def __init__(self, calls: int, seconds: int):
        self.calls = calls
        self.seconds = seconds
        self.hits: dict[str, deque] = defaultdict(deque)

    def __call__(self, request: Request) -> None:
        who = request.client.host if request.client else "unknown"
        now = time.monotonic()

        if len(self.hits) > 10_000:
            self.hits.clear()

        recent = self.hits[who]
        while recent and now - recent[0] > self.seconds:
            recent.popleft()

        if len(recent) >= self.calls:
            raise HTTPException(
                status_code=429,
                detail="Too many requests. Please slow down and try again shortly.",
                headers={"Retry-After": str(self.seconds)},
            )
        recent.append(now)
