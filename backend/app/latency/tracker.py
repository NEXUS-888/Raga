import time
import numpy as np
from typing import List, Dict, Any
from pydantic import BaseModel

class StageTimings(BaseModel):
    stt_ms: float = 0.0
    guardrail_input_ms: float = 0.0
    embedding_ms: float = 0.0
    vector_search_ms: float = 0.0
    bm25_search_ms: float = 0.0
    total_retrieval_ms: float = 0.0
    generation_ms: float = 0.0
    guardrail_output_ms: float = 0.0
    total_pipeline_ms: float = 0.0

class LatencyTracker:
    """
    Computes accurate P50, P70, and P100 percentile distributions across latency runs.
    """
    @staticmethod
    def calculate_percentiles(values: List[float]) -> Dict[str, float]:
        if not values:
            return {"p50": 0.0, "p70": 0.0, "p100": 0.0, "mean": 0.0, "min": 0.0, "max": 0.0}
        
        arr = np.array(values)
        return {
            "p50": round(float(np.percentile(arr, 50)), 2),
            "p70": round(float(np.percentile(arr, 70)), 2),
            "p90": round(float(np.percentile(arr, 90)), 2),
            "p99": round(float(np.percentile(arr, 99)), 2),
            "p100": round(float(np.max(arr)), 2),
            "mean": round(float(np.mean(arr)), 2),
            "min": round(float(np.min(arr)), 2),
            "max": round(float(np.max(arr)), 2),
            "std": round(float(np.std(arr)), 2)
        }
