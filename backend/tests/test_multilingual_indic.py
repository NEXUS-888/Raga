"""
Multilingual and Indic (Devanagari / Hindi) evaluation tests on ai4bharat/MSMARCO-XI corpus.
"""
import pytest
from app.chunking.recursive_chunker import RecursiveHierarchicalChunker
from app.chunking.semantic_chunker import SemanticChunker
from app.chunking.sliding_chunker import SlidingWindowChunker
from app.chunking.metadata_chunker import MetadataAwareChunker
from app.services.vector_db import vector_db
from app.core.dataset_loader import dataset_manager

INDIC_HINDI_DOC = """# TITLE: गोवा राज्य का परिचय
# SECTION: राजधानी और भूगोल
गोवा भारत के दक्षिण-पश्चिमी तट पर स्थित एक सुंदर राज्य है। गोवा की प्रशासनिक राजधानी पणजी है।
# SECTION: आधिकारिक भाषा
गोवा की आधिकारिक राजभाषा कोंकणी है जो देवनागरी लिपि में लिखी जाती है।
मराठी और हिंदी का उपयोग भी व्यापक रूप से किया जाता है।
"""

@pytest.mark.multilingual
def test_indic_recursive_chunking():
    chunker = RecursiveHierarchicalChunker(target_chunk_size=120, overlap_size=25)
    chunks = chunker.chunk(INDIC_HINDI_DOC, doc_id="hi_01", metadata={"lang": "hi"})
    
    assert len(chunks) >= 2
    assert any("गोवा" in c.content for c in chunks)
    assert any("राजभाषा" in c.content or "भाषा" in c.content for c in chunks)
    for c in chunks:
        assert c.metadata["lang"] == "hi"

@pytest.mark.multilingual
def test_indic_metadata_aware_chunking():
    chunker = MetadataAwareChunker(default_chunk_size=100)
    chunks = chunker.chunk(INDIC_HINDI_DOC, doc_id="hi_02", metadata={"lang": "hi"})
    
    sections = [c.metadata.get("section") for c in chunks if "section" in c.metadata]
    assert any("राजधानी" in s or "आधिकारिक" in s for s in sections)

@pytest.mark.multilingual
def test_indic_vector_retrieval():
    vector_db.build_index(strategy="metadata_aware")
    chunks, timings = vector_db.retrieve("गोवा की आधिकारिक भाषा और पणजी", top_k=3)
    
    assert len(chunks) >= 1
    contents_joined = " ".join([c.content for c in chunks])
    assert "गोवा" in contents_joined or "भाषा" in contents_joined or "पणजी" in contents_joined
    assert timings["total_retrieval_time_ms"] < 10.0
