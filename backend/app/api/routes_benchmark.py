from fastapi import APIRouter, Query, HTTPException
from typing import Optional, List
from pydantic import BaseModel
from app.latency.benchmark_suite import benchmark_engine, BenchmarkSummary
from app.core.dataset_loader import dataset_manager, BenchmarkQuery

router = APIRouter(prefix="/benchmark", tags=["Latency Analytics & Benchmarks"])

class BenchmarkRequest(BaseModel):
    num_iterations: int = 1
    chunking_strategy: str = "recursive_hierarchical"
    category_filter: Optional[str] = None

@router.post("/run", response_model=BenchmarkSummary)
async def run_benchmark(payload: BenchmarkRequest) -> BenchmarkSummary:
    """
    Executes automated query suite and outputs P50, P70, P100 latency analytics.
    """
    if payload.num_iterations < 1 or payload.num_iterations > 10:
        raise HTTPException(status_code=400, detail="num_iterations must be between 1 and 10.")

    summary = await benchmark_engine.run_benchmark(
        num_iterations=payload.num_iterations,
        chunking_strategy=payload.chunking_strategy
    )
    return summary

@router.get("/queries", response_model=List[BenchmarkQuery])
async def list_benchmark_queries(category: Optional[str] = None) -> List[BenchmarkQuery]:
    """
    Returns curated test queries across factual, Indic, off-topic, and adversarial categories.
    """
    return dataset_manager.get_benchmark_queries(category=category)
