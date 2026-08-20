from fastapi import APIRouter, Query
from typing import List, Dict, Any, Optional
from app.core.dataset_loader import dataset_manager, Document
from app.services.vector_db import vector_db

router = APIRouter(prefix="/dataset", tags=["MSMARCO-XI Dataset"])

@router.get("/documents", response_model=List[Document])
async def list_documents(language: Optional[str] = None) -> List[Document]:
    """
    Returns indexed documents from the ai4bharat/MSMARCO-XI corpus.
    """
    return dataset_manager.get_all_documents(language=language)

@router.get("/stats")
async def get_dataset_stats() -> Dict[str, Any]:
    """
    Returns index statistics, total chunks, active chunking strategy, and language breakdown.
    """
    docs = dataset_manager.get_all_documents()
    langs = {}
    for d in docs:
        langs[d.language] = langs.get(d.language, 0) + 1

    return {
        "dataset_name": "ai4bharat/MSMARCO-XI",
        "total_documents": len(docs),
        "total_indexed_chunks": len(vector_db.chunks),
        "active_chunking_strategy": vector_db.active_strategy,
        "languages": langs,
        "embedding_dimension": vector_db.embedding_engine.dimension,
        "vector_search_engine": "In-Memory HNSW + BM25 Hybrid (RRF)"
    }
