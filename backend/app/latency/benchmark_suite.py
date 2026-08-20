import time
import asyncio
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from app.core.dataset_loader import dataset_manager, BenchmarkQuery
from app.harness.orchestrator import orchestrator
from app.harness.structured_types import VoiceRAGRequest, VoiceRAGResponse
from app.latency.tracker import LatencyTracker

class QueryBenchmarkResult(BaseModel):
    query_id: str
    query_text: str
    category: str
    language: str
    total_ms: float
    stt_ms: float
    retrieval_ms: float
    generation_ms: float
    guardrails_ms: float
    is_refusal: bool
    target_met: bool
    answer_preview: str

class BenchmarkSummary(BaseModel):
    total_queries_tested: int
    successful_queries: int
    target_met_count: int
    target_met_percentage: float
    strategy_used: str
    p50_total_ms: float
    p70_total_ms: float
    p100_total_ms: float
    mean_total_ms: float
    min_total_ms: float
    max_total_ms: float
    breakdown_p50: Dict[str, float]
    breakdown_p70: Dict[str, float]
    breakdown_p100: Dict[str, float]
    query_results: List[QueryBenchmarkResult] = Field(default_factory=list)

class BenchmarkEngine:
    """
    Automated Latency & Quality Benchmarking Engine for Voice RAG Pipeline.
    Evaluates P50, P70, P100 across multilingual and multi-domain test suites.
    """
    def __init__(self):
        self.tracker = LatencyTracker()

    async def run_benchmark(
        self,
        num_iterations: int = 1,
        chunking_strategy: str = "recursive_hierarchical",
        queries_subset: Optional[List[str]] = None
    ) -> BenchmarkSummary:
        all_queries = dataset_manager.get_benchmark_queries()
        if queries_subset:
            all_queries = [q for q in all_queries if q.query_id in queries_subset or q.category in queries_subset]

        results: List[QueryBenchmarkResult] = []
        total_latencies: List[float] = []
        stt_latencies: List[float] = []
        retrieval_latencies: List[float] = []
        generation_latencies: List[float] = []
        guardrails_latencies: List[float] = []

        for iteration in range(num_iterations):
            for bq in all_queries:
                req = VoiceRAGRequest(
                    query_text=bq.query_text,
                    chunking_strategy=chunking_strategy,
                    language=bq.language,
                    top_k=3
                )
                
                # Execute pipeline through orchestrator harness
                resp: VoiceRAGResponse = await orchestrator.execute_text_pipeline(req)
                
                total_ms = resp.latency.total_pipeline_ms
                retrieval_ms = resp.latency.total_retrieval_ms
                generation_ms = resp.latency.generation_ms
                guardrails_ms = resp.latency.guardrail_input_ms + resp.latency.guardrail_output_ms
                stt_ms = resp.latency.stt_ms

                total_latencies.append(total_ms)
                stt_latencies.append(stt_ms)
                retrieval_latencies.append(retrieval_ms)
                generation_latencies.append(generation_ms)
                guardrails_latencies.append(guardrails_ms)

                results.append(QueryBenchmarkResult(
                    query_id=f"{bq.query_id}_i{iteration}",
                    query_text=bq.query_text,
                    category=bq.category,
                    language=bq.language,
                    total_ms=total_ms,
                    stt_ms=stt_ms,
                    retrieval_ms=retrieval_ms,
                    generation_ms=generation_ms,
                    guardrails_ms=guardrails_ms,
                    is_refusal=resp.is_refusal,
                    target_met=resp.latency.target_met,
                    answer_preview=resp.answer[:120] + "..." if len(resp.answer) > 120 else resp.answer
                ))

        total_stats = self.tracker.calculate_percentiles(total_latencies)
        stt_stats = self.tracker.calculate_percentiles(stt_latencies)
        retrieval_stats = self.tracker.calculate_percentiles(retrieval_latencies)
        generation_stats = self.tracker.calculate_percentiles(generation_latencies)
        guardrails_stats = self.tracker.calculate_percentiles(guardrails_latencies)

        target_met_count = sum(1 for r in results if r.target_met)
        target_met_percentage = round((target_met_count / len(results)) * 100, 1) if results else 0.0

        return BenchmarkSummary(
            total_queries_tested=len(results),
            successful_queries=len(results),
            target_met_count=target_met_count,
            target_met_percentage=target_met_percentage,
            strategy_used=chunking_strategy,
            p50_total_ms=total_stats["p50"],
            p70_total_ms=total_stats["p70"],
            p100_total_ms=total_stats["p100"],
            mean_total_ms=total_stats["mean"],
            min_total_ms=total_stats["min"],
            max_total_ms=total_stats["max"],
            breakdown_p50={
                "stt_p50": stt_stats["p50"],
                "retrieval_p50": retrieval_stats["p50"],
                "generation_p50": generation_stats["p50"],
                "guardrails_p50": guardrails_stats["p50"]
            },
            breakdown_p70={
                "stt_p70": stt_stats["p70"],
                "retrieval_p70": retrieval_stats["p70"],
                "generation_p70": generation_stats["p70"],
                "guardrails_p70": guardrails_stats["p70"]
            },
            breakdown_p100={
                "stt_p100": stt_stats["p100"],
                "retrieval_p100": retrieval_stats["p100"],
                "generation_p100": generation_stats["p100"],
                "guardrails_p100": guardrails_stats["p100"]
            },
            query_results=results
        )

benchmark_engine = BenchmarkEngine()
