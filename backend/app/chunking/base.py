from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class Chunk(BaseModel):
    chunk_id: str
    doc_id: str
    content: str
    strategy: str
    chunk_index: int
    char_count: int
    word_count: int
    metadata: Dict[str, Any] = Field(default_factory=dict)
    score: Optional[float] = None

class BaseChunker(ABC):
    @abstractmethod
    def chunk(self, text: str, doc_id: str, metadata: Optional[Dict[str, Any]] = None) -> List[Chunk]:
        """Split raw text into structured chunks according to the strategy."""
        pass
