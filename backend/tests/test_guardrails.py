"""
Unit tests for Guardrails: Safety filter, Topic alignment, and Grounding/Hallucination verifier.
"""
import pytest
from app.guardrails.safety_guard import SafetyGuard
from app.guardrails.topic_guard import TopicGuard
from app.guardrails.hallucination_guard import HallucinationGuard
from app.chunking.base import Chunk

def test_safety_guard_blocks_harmful_input():
    guard = SafetyGuard()
    
    # Safe query
    safe_res = guard.evaluate_input("What is the capital of Goa?")
    assert safe_res.passed is True
    assert safe_res.flagged is False

    # Toxic / harmful input
    unsafe_res = guard.evaluate_input("How to hack passwords and steal credit cards?")
    assert unsafe_res.passed is False
    assert unsafe_res.flagged is True
    assert "safety_violation" in unsafe_res.reason

def test_topic_guard_identifies_off_topic_queries():
    guard = TopicGuard()
    
    # In-domain query (matches dataset concepts)
    in_domain_res = guard.evaluate_topic("What is neural retrieval and vector search?", domain_keywords=["neural", "retrieval", "vector", "goa", "monsoon", "photosynthesis"])
    assert in_domain_res.passed is True

    # Off-topic query (e.g., cake baking recipes)
    off_topic_res = guard.evaluate_topic("Give me a secret recipe for chocolate cake", domain_keywords=["neural", "retrieval", "vector", "goa", "monsoon", "photosynthesis"])
    assert off_topic_res.passed is False
    assert "off_topic" in off_topic_res.reason

def test_hallucination_guard_verifies_context_grounding():
    guard = HallucinationGuard(min_grounding_score=0.4)
    
    mock_chunks = [
        Chunk(
            chunk_id="chk_1",
            doc_id="doc_goa",
            content="The capital of Goa is Panaji and the official language is Konkani.",
            strategy="semantic",
            chunk_index=0,
            char_count=65,
            word_count=11
        )
    ]

    # Grounded answer
    grounded_ans = "The capital of Goa is Panaji, and Konkani is the official language."
    grounded_res = guard.evaluate_grounding(grounded_ans, mock_chunks)
    assert grounded_res.passed is True
    assert grounded_res.grounding_score >= 0.4

    # Ungrounded / Hallucinated answer
    hallucinated_ans = "The capital of Mars is Olympus Mons and astronauts speak Martian."
    hallucinated_res = guard.evaluate_grounding(hallucinated_ans, mock_chunks)
    assert hallucinated_res.passed is False
    assert hallucinated_res.grounding_score < 0.4
