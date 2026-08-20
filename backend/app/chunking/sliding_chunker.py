from typing import List, Dict, Any, Optional
from app.chunking.base import BaseChunker, Chunk

class SlidingWindowChunker(BaseChunker):
    """
    Sliding window chunker based on fixed word counts with sliding overlap.
    Ensures dense temporal/topical continuity between adjacent chunks.
    """
    def __init__(self, window_size: int = 60, step_size: int = 40):
        self.window_size = window_size
        self.step_size = step_size

    def chunk(self, text: str, doc_id: str, metadata: Optional[Dict[str, Any]] = None) -> List[Chunk]:
        words = text.split()
        if not words:
            return []

        results = []
        idx = 0
        start = 0
        while start < len(words):
            end = min(start + self.window_size, len(words))
            chunk_words = words[start:end]
            content = " ".join(chunk_words).strip()
            
            chunk_meta = dict(metadata or {})
            chunk_meta.update({
                "strategy": "sliding_window",
                "window_size": self.window_size,
                "step_size": self.step_size,
                "overlap_ratio": round((self.window_size - self.step_size) / self.window_size, 2)
            })

            results.append(Chunk(
                chunk_id=f"{doc_id}_slide_{idx}",
                doc_id=doc_id,
                content=content,
                strategy="sliding_window",
                chunk_index=idx,
                char_count=len(content),
                word_count=len(chunk_words),
                metadata=chunk_meta
            ))
            idx += 1
            if end >= len(words):
                break
            start += self.step_size

        return results
