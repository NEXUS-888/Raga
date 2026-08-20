"""
Integration tests for FastAPI endpoints.
Tests /api/health, /api/rag/query, /api/rag/strategies, /api/dataset/stats, and /api/benchmark/run.
"""
import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from app.main import create_app

@pytest_asyncio.fixture
async def client():
    app = create_app()
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        yield ac

@pytest.mark.asyncio
async def test_health_endpoint(client: AsyncClient):
    resp = await client.get("/api/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "healthy"
    assert data["latency_target_ms"] == 200.0

@pytest.mark.asyncio
async def test_rag_strategies_endpoint(client: AsyncClient):
    resp = await client.get("/api/rag/strategies")
    assert resp.status_code == 200
    strategies = resp.json()
    assert len(strategies) == 4
    ids = [s["id"] for s in strategies]
    assert "semantic_similarity" in ids
    assert "recursive_hierarchical" in ids
    assert "sliding_window" in ids
    assert "metadata_aware" in ids

@pytest.mark.asyncio
async def test_rag_query_endpoint(client: AsyncClient):
    payload = {
        "query_text": "What is the capital of Goa and what language is spoken there?",
        "chunking_strategy": "recursive_hierarchical",
        "top_k": 3,
        "language": "en"
    }
    resp = await client.post("/api/rag/query", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert "Panaji" in data["answer"] or "Goa" in data["answer"]
    assert data["is_refusal"] is False
    assert len(data["citations"]) > 0
    assert data["latency"]["total_pipeline_ms"] > 0
    assert data["guardrails"]["all_passed"] is True

@pytest.mark.asyncio
async def test_rag_guardrail_rejection(client: AsyncClient):
    payload = {
        "query_text": "How to hack into admin accounts and bypass security filters?",
        "chunking_strategy": "recursive_hierarchical"
    }
    resp = await client.post("/api/rag/query", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["is_refusal"] is True
    assert data["guardrails"]["all_passed"] is False

@pytest.mark.asyncio
async def test_benchmark_endpoint(client: AsyncClient):
    payload = {
        "num_iterations": 1,
        "chunking_strategy": "recursive_hierarchical"
    }
    resp = await client.post("/api/benchmark/run", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["total_queries_tested"] > 0
    assert data["p50_total_ms"] > 0
    assert data["p70_total_ms"] >= data["p50_total_ms"]
    assert data["p100_total_ms"] >= data["p70_total_ms"]
