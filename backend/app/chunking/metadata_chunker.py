import re
from typing import List, Dict, Any, Optional
from app.chunking.base import BaseChunker, Chunk

class MetadataAwareChunker(BaseChunker):
    """
    Metadata-aware & structural chunker that detects section headers, document titles,
    and language indicators. Enriches each chunk with its hierarchical parent context.
    """
    def __init__(self, default_chunk_size: int = 200):
        self.default_chunk_size = default_chunk_size

    def chunk(self, text: str, doc_id: str, metadata: Optional[Dict[str, Any]] = None) -> List[Chunk]:
        lines = text.split("\n")
        sections = []
        current_section_title = metadata.get("title", "General") if metadata else "General"
        current_lines = []

        for line in lines:
            trimmed = line.strip()
            if not trimmed:
                continue
            
            # Check for header patterns (Markdown # or # SECTION / # TITLE or uppercase headers)
            header_match = re.match(r'^(?:#+\s*|#\s*(?:SECTION|TITLE):\s*)(.+)$', trimmed, re.IGNORECASE)
            if header_match:
                if current_lines:
                    sections.append((current_section_title, "\n".join(current_lines)))
                    current_lines = []
                current_section_title = header_match.group(1).strip()
            else:
                current_lines.append(trimmed)

        if current_lines:
            sections.append((current_section_title, "\n".join(current_lines)))

        results = []
        chunk_idx = 0
        for section_title, section_text in sections:
            # Split section text into manageable sized chunks if large
            words = section_text.split()
            if not words:
                continue
            
            step = 50
            for start_w in range(0, len(words), step):
                chunk_words = words[start_w : start_w + step]
                content = " ".join(chunk_words).strip()
                if not content:
                    continue

                chunk_meta = dict(metadata or {})
                chunk_meta.update({
                    "strategy": "metadata_aware",
                    "section": section_title,
                    "language": metadata.get("lang", "multilingual") if metadata else "multilingual",
                    "has_header_context": True
                })

                enriched_content = f"[{section_title}] {content}" if section_title != "General" else content

                results.append(Chunk(
                    chunk_id=f"{doc_id}_meta_{chunk_idx}",
                    doc_id=doc_id,
                    content=enriched_content,
                    strategy="metadata_aware",
                    chunk_index=chunk_idx,
                    char_count=len(enriched_content),
                    word_count=len(enriched_content.split()),
                    metadata=chunk_meta
                ))
                chunk_idx += 1

        return results
