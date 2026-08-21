import re
from typing import List, Dict, Any, Optional
from app.chunking.base import BaseChunker, Chunk

class RecursiveHierarchicalChunker(BaseChunker):
    """
    Splits text hierarchically using a priority order of delimiters
    (paragraphs -> sentences -> clauses -> words) to keep semantic coherent blocks.
    """
    def __init__(self, target_chunk_size: int = 450, overlap_size: int = 50):
        self.target_chunk_size = target_chunk_size
        self.overlap_size = overlap_size
        self.separators = ["\n\n", "\n", ". ", "? ", "! ", "; ", ", ", " "]

    def _split_text(self, text: str, separators: List[str]) -> List[str]:
        if not separators:
            return list(text)
        
        sep = separators[0]
        splits = []
        if sep:
            parts = text.split(sep)
            for i, part in enumerate(parts):
                if i < len(parts) - 1:
                    splits.append(part + sep)
                else:
                    if part:
                        splits.append(part)
        else:
            splits = list(text)

        final_chunks = []
        good_splits = []
        for s in splits:
            if len(s) < self.target_chunk_size:
                good_splits.append(s)
            else:
                if good_splits:
                    merged = self._merge_splits(good_splits)
                    final_chunks.extend(merged)
                    good_splits = []
                other_splits = self._split_text(s, separators[1:])
                final_chunks.extend(other_splits)
        
        if good_splits:
            merged = self._merge_splits(good_splits)
            final_chunks.extend(merged)
            
        return final_chunks

    def _merge_splits(self, splits: List[str]) -> List[str]:
        merged = []
        current_doc = []
        total_len = 0
        
        for s in splits:
            s_len = len(s)
            if total_len + s_len > self.target_chunk_size:
                if current_doc:
                    doc_text = "".join(current_doc).strip()
                    # Do not create isolated heading chunks
                    lines = [l.strip() for l in doc_text.split("\n") if l.strip()]
                    has_body = any(not l.startswith("#") for l in lines)
                    if doc_text and has_body:
                        merged.append(doc_text)
                    
                    # Apply overlap: keep suffix of previous chunks
                    while current_doc and total_len > self.overlap_size:
                        popped = current_doc.pop(0)
                        total_len -= len(popped)
            current_doc.append(s)
            total_len += s_len
            
        if current_doc:
            doc_text = "".join(current_doc).strip()
            if doc_text:
                merged.append(doc_text)
        return merged

    def chunk(self, text: str, doc_id: str, metadata: Optional[Dict[str, Any]] = None) -> List[Chunk]:
        raw_chunks = self._split_text(text, self.separators)
        results = []
        for idx, content in enumerate(raw_chunks):
            content_clean = content.strip()
            if not content_clean:
                continue
            # Ensure chunk has body content or merge
            lines = [l.strip() for l in content_clean.split("\n") if l.strip()]
            if not any(not l.startswith("#") for l in lines):
                continue
            chunk_meta = dict(metadata or {})
            chunk_meta.update({
                "strategy": "recursive_hierarchical",
                "target_size": self.target_chunk_size,
                "overlap": self.overlap_size
            })
            results.append(Chunk(
                chunk_id=f"{doc_id}_rec_{idx}",
                doc_id=doc_id,
                content=content_clean,
                strategy="recursive_hierarchical",
                chunk_index=idx,
                char_count=len(content_clean),
                word_count=len(content_clean.split()),
                metadata=chunk_meta
            ))
        return results
