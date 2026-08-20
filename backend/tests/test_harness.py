"""
Unit tests for Model Harness: Structured Orchestration, Retries, Fallbacks, and Error Recovery.
"""
import pytest
import asyncio
from app.harness.retry_policy import AsyncRetryPolicy, CircuitBreaker
from app.harness.orchestrator import PipelineOrchestrator
from app.harness.structured_types import VoiceRAGRequest

@pytest.mark.asyncio
async def test_retry_policy_recovers_after_transient_failure():
    attempts = 0
    policy = AsyncRetryPolicy(max_retries=3, initial_delay=0.01)

    async def flaky_operation():
        nonlocal attempts
        attempts += 1
        if attempts < 3:
            raise ConnectionError("Transient network glitch")
        return "success"

    result = await policy.execute_with_retry(flaky_operation)
    assert result == "success"
    assert attempts == 3

@pytest.mark.asyncio
async def test_circuit_breaker_trips_on_consecutive_failures():
    cb = CircuitBreaker(failure_threshold=2, recovery_timeout=0.1)
    
    async def always_failing():
        raise ValueError("Critical service error")

    with pytest.raises(ValueError):
        await cb.call(always_failing)
    with pytest.raises(ValueError):
        await cb.call(always_failing)

    # Circuit should now be open
    assert cb.is_open is True

@pytest.mark.asyncio
async def test_orchestrator_end_to_end_execution():
    orchestrator = PipelineOrchestrator()
    req = VoiceRAGRequest(
        query_text="What is the capital of Goa and what language is spoken there?",
        chunking_strategy="recursive_hierarchical",
        top_k=3,
        language="en"
    )
    
    response = await orchestrator.execute_text_pipeline(req)
    assert response.query == req.query_text
    assert response.is_refusal is False
    assert len(response.citations) > 0
    assert response.latency.total_pipeline_ms > 0
    assert len(response.harness_trace) >= 4  # pre-guardrail, retrieval, generation, post-guardrail
