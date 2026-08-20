"""
Unit tests for Fast Embedding Engine and Hybrid Vector Database (HNSW + BM25Okapi + RRF).
"""
import pytest
import numpy as np
from app.services.vector_db import FastEmbeddingEngine, HybridVectorDB
from app.core.dataset_loader import Document

@pytest.mark.unit
def test_fast_embedding_engine():
    engine = FastEmbeddingEngine(dimension=128)
    corpus = [
        "Goa is a coastal state in India.",
        "Neural search uses dense vector representations.",
        "Sarvam AI specializes in Indic speech models."
    ]
    engine.fit(corpus)
    
    vec = engine.embed("Goa tourism")
    assert isinstance(vec, np.ndarray)
    assert len(vec) == 128
    # L2 normalized
    norm = np.linalg.norm(vec)
    assert abs(norm - 1.0) < 1e-4

@pytest.mark.unit
def test_hybrid_vector_db_indexing_all_strategies():
    strategies = [
        "recursive_hierarchical",
        "semantic_similarity",
        "sliding_window",
        "metadata_aware"
    ]
    
    db = HybridVectorDB()
    for strat in strategies:
        chunk_count = db.build_index(strategy=strat)
        assert chunk_count > 0
        assert len(db.chunks) == chunk_count
        assert db.chunk_embeddings.shape[0] == chunk_count
        assert db.chunk_embeddings.shape[1] == 128

@pytest.mark.unit
def test_hybrid_vector_db_retrieval_speed_and_accuracy():
    db = HybridVectorDB()
    db.build_index(strategy="recursive_hierarchical")
    
    chunks, timings = db.retrieve(query="What is the capital of Goa?", top_k=3)
    
    assert len(chunks) == 3
    # Verify retrieval latency is sub-10ms
    assert timings["total_retrieval_time_ms"] < 10.0
    # Top chunk should contain relevant Goa information
    top_content = chunks[0].content.lower()
    assert "panaji" in top_content or "goa" in top_content
    # Score should be computed
    assert chunks[0].score is not None
    assert chunks[0].score >= chunks[1].score

@pytest.mark.unit
def test_vector_db_empty_and_unknown_terms():
    db = HybridVectorDB()
    db.build_index(strategy="sliding_window")
    
    # Query with out-of-vocabulary terms
    chunks, timings = db.retrieve(query="xyz999qwerty unmatched token", top_k=2)
    assert len(chunks) <= 2
    assert timings["total_retrieval_time_ms"] < 10.0
