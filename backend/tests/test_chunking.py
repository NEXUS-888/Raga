"""
Unit tests for vast multi-strategy chunking pipeline.
Verifies Semantic, Recursive, Sliding Window, and Metadata-Aware chunkers.
"""
import pytest
from app.chunking.base import Chunk
from app.chunking.semantic_chunker import SemanticChunker
from app.chunking.recursive_chunker import RecursiveHierarchicalChunker
from app.chunking.sliding_chunker import SlidingWindowChunker
from app.chunking.metadata_chunker import MetadataAwareChunker

SAMPLE_DOC = """
Artificial Intelligence and Machine Learning have transformed modern retrieval systems. Traditional search engines relied heavily on exact keyword matching like BM25.
However, modern Neural Information Retrieval uses dense vector embeddings to capture semantic relationships between queries and passages.

Retrieval-Augmented Generation combines fast retrieval with generative models. In this architecture, a retriever finds relevant context from a knowledge base.
Then, a large language model synthesizes an accurate, grounded answer using the provided context while avoiding hallucinations.

For voice-enabled systems, latency is critical. Every millisecond counts across speech-to-text, vector search, and model generation.
"""

def test_recursive_hierarchical_chunker():
    chunker = RecursiveHierarchicalChunker(target_chunk_size=150, overlap_size=30)
    chunks = chunker.chunk(SAMPLE_DOC, doc_id="doc_1", metadata={"source": "ai4bharat/MSMARCO-XI"})
    
    assert len(chunks) >= 2
    for chunk in chunks:
        assert isinstance(chunk, Chunk)
        assert len(chunk.content.strip()) > 0
        assert chunk.doc_id == "doc_1"
        assert chunk.strategy == "recursive_hierarchical"
        assert "source" in chunk.metadata

def test_sliding_window_chunker():
    chunker = SlidingWindowChunker(window_size=30, step_size=20)
    chunks = chunker.chunk(SAMPLE_DOC, doc_id="doc_2", metadata={"lang": "en"})
    
    assert len(chunks) >= 2
    for i, chunk in enumerate(chunks):
        assert chunk.doc_id == "doc_2"
        assert chunk.strategy == "sliding_window"
        assert chunk.chunk_index == i

def test_semantic_chunker():
    chunker = SemanticChunker(similarity_threshold=0.6)
    chunks = chunker.chunk(SAMPLE_DOC, doc_id="doc_3", metadata={"domain": "cs"})
    
    assert len(chunks) >= 1
    for chunk in chunks:
        assert chunk.doc_id == "doc_3"
        assert chunk.strategy == "semantic_similarity"
        assert len(chunk.content) > 0

def test_metadata_aware_chunker():
    structured_doc = """
# TITLE: Voice RAG Architectures
# SECTION: Latency Optimization
To achieve sub-200ms latency, vector search must complete in under 10ms.
# SECTION: Guardrails
Guardrails must reject off-topic and toxic queries before model invocation.
"""
    chunker = MetadataAwareChunker(default_chunk_size=100)
    chunks = chunker.chunk(structured_doc, doc_id="doc_4", metadata={"author": "HH Goa"})
    
    assert len(chunks) >= 2
    section_titles = [c.metadata.get("section") for c in chunks if "section" in c.metadata]
    assert len(section_titles) > 0
    assert any("Latency" in str(s) or "Guardrails" in str(s) for s in section_titles)
