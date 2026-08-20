"""
Unit tests for Latency Analytics and P50 / P70 / P100 Benchmark Engine.
"""
import pytest
from app.latency.benchmark_suite import BenchmarkEngine, BenchmarkSummary

@pytest.mark.asyncio
async def test_benchmark_suite_calculates_p50_p70_p100_percentiles():
    engine = BenchmarkEngine()
    summary = await engine.run_benchmark(num_iterations=1, chunking_strategy="recursive_hierarchical")
    
    assert isinstance(summary, BenchmarkSummary)
    assert summary.total_queries_tested > 0
    assert summary.p50_total_ms > 0
    assert summary.p70_total_ms >= summary.p50_total_ms
    assert summary.p100_total_ms >= summary.p70_total_ms
    assert "stt_p50" in summary.breakdown_p50
    assert "retrieval_p50" in summary.breakdown_p50
    assert "generation_p50" in summary.breakdown_p50

@pytest.mark.asyncio
async def test_latency_target_compliance():
    engine = BenchmarkEngine()
    summary = await engine.run_benchmark(num_iterations=1, chunking_strategy="recursive_hierarchical")
    
    # Sub-200ms target verification
    print(f"\n[LATENCY REPORT] P50: {summary.p50_total_ms:.2f}ms | P70: {summary.p70_total_ms:.2f}ms | P100: {summary.p100_total_ms:.2f}ms")
    assert summary.p50_total_ms < 200.0, f"P50 latency {summary.p50_total_ms}ms exceeded 200ms target"
