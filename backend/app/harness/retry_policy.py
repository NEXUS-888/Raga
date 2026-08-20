import asyncio
import inspect
import time
import random
from typing import Callable, Any, TypeVar, Optional

T = TypeVar("T")

class CircuitBreakerOpenException(Exception):
    """Raised when circuit breaker is OPEN to prevent cascading failures."""

class CircuitBreaker:
    def __init__(self, failure_threshold: int = 3, recovery_timeout: float = 10.0):
        self.failure_threshold = failure_threshold
        self.recovery_timeout = recovery_timeout
        self.failure_count = 0
        self.last_failure_time = 0.0
        self.state = "CLOSED"  # CLOSED, OPEN, HALF_OPEN

    @property
    def is_open(self) -> bool:
        if self.state == "OPEN":
            if time.time() - self.last_failure_time > self.recovery_timeout:
                self.state = "HALF_OPEN"
                return False
            return True
        return False

    async def call(self, func: Callable[..., Any], *args, **kwargs) -> Any:
        if self.is_open:
            raise CircuitBreakerOpenException("Circuit breaker is OPEN due to repeated failures.")

        try:
            if inspect.iscoroutinefunction(func):
                result = await func(*args, **kwargs)
            else:
                result = func(*args, **kwargs)
            self._on_success()
            return result
        except Exception as e:
            self._on_failure()
            raise e

    def _on_success(self):
        self.failure_count = 0
        self.state = "CLOSED"

    def _on_failure(self):
        self.failure_count += 1
        self.last_failure_time = time.time()
        if self.failure_count >= self.failure_threshold:
            self.state = "OPEN"

class AsyncRetryPolicy:
    """
    Exponential backoff retry policy with jitter.
    """
    def __init__(self, max_retries: int = 2, initial_delay: float = 0.02, backoff_factor: float = 2.0, max_delay: float = 0.2):
        self.max_retries = max_retries
        self.initial_delay = initial_delay
        self.backoff_factor = backoff_factor
        self.max_delay = max_delay

    async def execute_with_retry(self, func: Callable[..., Any], *args, **kwargs) -> Any:
        attempt = 0
        delay = self.initial_delay
        last_exception = None

        while attempt < self.max_retries:
            try:
                if inspect.iscoroutinefunction(func):
                    return await func(*args, **kwargs)
                else:
                    return func(*args, **kwargs)
            except Exception as e:
                attempt += 1
                last_exception = e
                if attempt >= self.max_retries:
                    break
                jitter = random.uniform(0.8, 1.2)
                sleep_time = min(delay * jitter, self.max_delay)
                await asyncio.sleep(sleep_time)
                delay *= self.backoff_factor

        raise last_exception or RuntimeError("Retry attempts exhausted")
