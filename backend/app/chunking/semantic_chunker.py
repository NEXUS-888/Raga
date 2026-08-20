import re
import numpy as np
from typing import List, Dict, Any, Optional
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from app.chunking.base import BaseChunker, Chunk

class SemanticChunker(BaseChunker):
    """
    Semantic chunker that groups sentences based on semantic similarity.
    Calculates sentence-to-sentence similarity and identifies topic shifts to place chunk boundaries.
    """
    def __init__(self, similarity_threshold: float = 0.35, max_sentences_per_chunk: int = 4, min_sentences: int = 1):
        self.similarity_threshold = similarity_threshold
        self.max_sentences_per_chunk = max_sentences_per_chunk
        self.min_sentences = min_sentences

    def _split_into_sentences(self, text: str) -> List[str]:
        # Clean and split on sentence terminators while preserving Indic/English punctuation
        raw_sentences = re.split(r'(?<=[.!?।])\s+', text)
        sentences = [s.strip() for s in raw_sentences if s.strip()]
        return sentences

    def chunk(self, text: str, doc_id: str, metadata: Optional[Dict[str, Any]] = None) -> List[Chunk]:
        sentences = self._split_into_sentences(text)
        if not sentences:
            return []

        if len(sentences) == 1:
            chunk_meta = dict(metadata or {})
            chunk_meta["strategy"] = "semantic_similarity"
            return [Chunk(
                chunk_id=f"{doc_id}_sem_0",
                doc_id=doc_id,
                content=sentences[0],
                strategy="semantic_similarity",
                chunk_index=0,
                char_count=len(sentences[0]),
                word_count=len(sentences[0].split()),
                metadata=chunk_meta
            )]

        # Vectorize sentences to compute sequential semantic similarity
        vectorizer = TfidfVectorizer(ngram_range=(1, 2), min_df=1)
        try:
            tfidf_matrix = vectorizer.fit_transform(sentences)
            sim_matrix = cosine_similarity(tfidf_matrix)
        except Exception:
            sim_matrix = np.eye(len(sentences))

        chunks_grouped = []
        current_chunk_sentences = [sentences[0]]

        for i in range(1, len(sentences)):
            # Compare current sentence to previous group / previous sentence
            prev_sim = sim_matrix[i - 1, i]
            
            # Condition to break chunk:
            # 1. Similarity is lower than threshold AND minimum sentence count met
            # 2. Or reached max sentences per chunk limit
            if (prev_sim < self.similarity_threshold and len(current_chunk_sentences) >= self.min_sentences) or \
               (len(current_chunk_sentences) >= self.max_sentences_per_chunk):
                chunks_grouped.append(" ".join(current_chunk_sentences))
                current_chunk_sentences = [sentences[i]]
            else:
                current_chunk_sentences.append(sentences[i])

        if current_chunk_sentences:
            chunks_grouped.append(" ".join(current_chunk_sentences))

        results = []
        for idx, content in enumerate(chunks_grouped):
            content_clean = content.strip()
            if not content_clean:
                continue
            chunk_meta = dict(metadata or {})
            chunk_meta.update({
                "strategy": "semantic_similarity",
                "similarity_threshold": self.similarity_threshold,
                "sentence_count": len(self._split_into_sentences(content_clean))
            })
            results.append(Chunk(
                chunk_id=f"{doc_id}_sem_{idx}",
                doc_id=doc_id,
                content=content_clean,
                strategy="semantic_similarity",
                chunk_index=idx,
                char_count=len(content_clean),
                word_count=len(content_clean.split()),
                metadata=chunk_meta
            ))

        return results
