import time
import base64
import json
from pathlib import Path
from typing import List, Optional
from app.harness.structured_types import (
    VoiceRAGRequest,
    VoiceRAGResponse,
    LatencyWaterfall,
    HarnessTraceStep
)
from app.harness.retry_policy import AsyncRetryPolicy, CircuitBreaker
from app.services.stt_service import stt_service
from app.services.vector_db import vector_db
from app.services.llm_service import llm_service
from app.guardrails.manager import guardrail_manager
from app.core.config import settings



class PipelineOrchestrator:
    """
    Production-grade Model Orchestration Harness.
    Orchestrates Voice STT, Multi-strategy Vector Retrieval, Guardrails,
    LLM Generation, and Granular Latency Profiling (<200ms target).
    """
    def __init__(self):
        self.retry_policy = AsyncRetryPolicy(max_retries=2, initial_delay=0.01)
        self.circuit_breaker = CircuitBreaker(failure_threshold=3, recovery_timeout=5.0)

    async def execute_voice_pipeline(self, audio_bytes: bytes, req: VoiceRAGRequest) -> VoiceRAGResponse:
        total_start = time.perf_counter()
        trace: List[HarnessTraceStep] = []
        waterfall = LatencyWaterfall()

        # Step 1: Speech-to-Text via Groq Whisper or Sarvam AI
        stt_t0 = time.perf_counter()
        transcript = ""
        stt_meta: dict = {}
        try:
            transcript, stt_ms, stt_meta = await stt_service.transcribe(
                audio_bytes=audio_bytes,
                provider=req.stt_provider,
                language_code="hi-IN" if "hi" in req.language else "en-IN",
                filename=req.audio_filename
            )
            stt_elapsed = (time.perf_counter() - stt_t0) * 1000
            waterfall.stt_ms = round(stt_elapsed, 2)
            trace.append(HarnessTraceStep(
                step_name="Speech-to-Text Transcription",
                status="success" if transcript else "empty",
                execution_time_ms=waterfall.stt_ms,
                details={"provider": stt_meta.get("provider", req.stt_provider), "transcript": transcript}
            ))
        except Exception as e:
            stt_elapsed = (time.perf_counter() - stt_t0) * 1000
            waterfall.stt_ms = round(stt_elapsed, 2)
            transcript = ""
            trace.append(HarnessTraceStep(
                step_name="Speech-to-Text Transcription",
                status="failed",
                execution_time_ms=waterfall.stt_ms,
                details={"error": str(e)}
            ))

        if not transcript or not transcript.strip():
            # Return polite refusal if no speech was picked up
            return VoiceRAGResponse(
                query="[Voice query - No speech recognized]",
                transcript="",
                answer="No clear speech was recognized from your microphone. Please click the mic and speak clearly into your microphone.",
                is_refusal=True,
                refusal_reason="No speech detected in audio stream.",
                citations=[],
                guardrails=guardrail_manager.check_input(""),
                latency=waterfall,
                harness_trace=trace,
                strategy_used=req.chunking_strategy,
                stt_provider_used=req.stt_provider
            )

        return await self._execute_text_flow(transcript, req, total_start, trace, waterfall, stt_provider_used=req.stt_provider)

    async def execute_text_pipeline(self, req: VoiceRAGRequest) -> VoiceRAGResponse:
        total_start = time.perf_counter()
        trace: List[HarnessTraceStep] = []
        waterfall = LatencyWaterfall()
        query = (req.query_text or "").strip()

        return await self._execute_text_flow(query, req, total_start, trace, waterfall, stt_provider_used="text_direct")

    async def _execute_text_flow(
        self,
        query: str,
        req: VoiceRAGRequest,
        total_start: float,
        trace: List[HarnessTraceStep],
        waterfall: LatencyWaterfall,
        stt_provider_used: str
    ) -> VoiceRAGResponse:
        # Step 2: Pre-retrieval Guardrails (Safety + Topic Alignment)
        g_in_t0 = time.perf_counter()
        guard_report = guardrail_manager.check_input(query)
        g_in_elapsed = (time.perf_counter() - g_in_t0) * 1000
        waterfall.guardrail_input_ms = round(g_in_elapsed, 2)

        if not guard_report.all_passed:
            trace.append(HarnessTraceStep(
                step_name="Pre-Retrieval Guardrails",
                status="refused",
                execution_time_ms=waterfall.guardrail_input_ms,
                details={
                    "safety": guard_report.safety.model_dump(),
                    "topic": guard_report.topic.model_dump(),
                    "refusal": guard_report.refusal_message
                }
            ))
            total_elapsed = (time.perf_counter() - total_start) * 1000
            waterfall.total_pipeline_ms = round(total_elapsed, 2)
            waterfall.target_met = waterfall.total_pipeline_ms <= settings.latency_target_ms

            return VoiceRAGResponse(
                query=query,
                transcript=query,
                answer=guard_report.refusal_message or "Query rejected by guardrails.",
                is_refusal=True,
                refusal_reason=guard_report.safety.reason if not guard_report.safety.passed else guard_report.topic.reason,
                citations=[],
                guardrails=guard_report,
                latency=waterfall,
                harness_trace=trace,
                strategy_used=req.chunking_strategy,
                stt_provider_used=stt_provider_used
            )

        trace.append(HarnessTraceStep(
            step_name="Pre-Retrieval Guardrails",
            status="success",
            execution_time_ms=waterfall.guardrail_input_ms,
            details={"safety_score": guard_report.safety.score, "topic_score": guard_report.topic.score}
        ))

        # Step 3: Hybrid Vector DB Retrieval with Selected Vast Chunking Strategy
        retrieval_t0 = time.perf_counter()
        # Ensure active strategy is configured
        if vector_db.active_strategy != req.chunking_strategy:
            vector_db.build_index(strategy=req.chunking_strategy)

        chunks, timings = vector_db.retrieve(query=query, top_k=req.top_k)
        retrieval_elapsed = (time.perf_counter() - retrieval_t0) * 1000
        waterfall.embedding_ms = timings["embedding_time_ms"]
        waterfall.vector_search_ms = timings["vector_search_time_ms"]
        waterfall.bm25_search_ms = timings["bm25_search_time_ms"]
        waterfall.total_retrieval_ms = round(retrieval_elapsed, 2)

        trace.append(HarnessTraceStep(
            step_name="Hybrid Vector DB Retrieval",
            status="success",
            execution_time_ms=waterfall.total_retrieval_ms,
            details={
                "strategy": req.chunking_strategy,
                "chunks_retrieved": len(chunks),
                "top_score": chunks[0].score if chunks else 0.0,
                "timings": timings
            }
        ))

        # Step 4: Ultra-Low Latency LLM Generation
        gen_t0 = time.perf_counter()
        is_domain_match = (guard_report.topic.reason in ["in_domain_rag", "in_domain_query"]) and bool(chunks)
        is_general = not is_domain_match
        try:
            answer, gen_ms, gen_meta = await self.retry_policy.execute_with_retry(
                llm_service.generate_rag_answer,
                query=query,
                retrieved_chunks=chunks,
                is_general_knowledge=is_general,
                provider=req.llm_provider
            )
            gen_elapsed = (time.perf_counter() - gen_t0) * 1000
            waterfall.generation_ms = round(gen_elapsed, 2)
            trace.append(HarnessTraceStep(
                step_name="LLM Grounded Synthesis",
                status="success",
                execution_time_ms=waterfall.generation_ms,
                details={
                    "llm_provider": gen_meta.get("provider", "default"),
                    "route_decision": gen_meta.get("route_decision", "auto"),
                    "route_reason": gen_meta.get("route_reason", ""),
                    "answer_length": len(answer),
                    "is_general": is_general
                }
            ))
        except Exception as e:
            gen_elapsed = (time.perf_counter() - gen_t0) * 1000
            waterfall.generation_ms = round(gen_elapsed, 2)
            answer = llm_service._synthesize_local_grounded_answer(query, chunks)
            trace.append(HarnessTraceStep(
                step_name="LLM Grounded Synthesis",
                status="recovered",
                execution_time_ms=waterfall.generation_ms,
                details={"fallback": "local_synthesizer", "error": str(e)}
            ))

        # Step 5: Post-retrieval Guardrails (Grounding & Hallucination Verification)
        g_out_t0 = time.perf_counter()
        guard_report = guardrail_manager.check_output(answer, chunks, guard_report)
        g_out_elapsed = (time.perf_counter() - g_out_t0) * 1000
        waterfall.guardrail_output_ms = round(g_out_elapsed, 2)

        is_refusal = not guard_report.all_passed
        final_answer = answer if not is_refusal else (guard_report.refusal_message or answer)
        refusal_reason = guard_report.grounding.reason if is_refusal and guard_report.grounding else None

        trace.append(HarnessTraceStep(
            step_name="Grounding & Hallucination Verification",
            status="refused" if is_refusal else "success",
            execution_time_ms=waterfall.guardrail_output_ms,
            details={
                "grounding_score": guard_report.grounding.grounding_score if guard_report.grounding else 0.0,
                "passed": guard_report.all_passed
            }
        ))

        # Final Total Latency
        total_elapsed = (time.perf_counter() - total_start) * 1000
        waterfall.total_pipeline_ms = round(total_elapsed, 2)
        waterfall.target_met = waterfall.total_pipeline_ms <= settings.latency_target_ms

        return VoiceRAGResponse(
            query=query,
            transcript=query,
            answer=final_answer,
            is_refusal=is_refusal,
            refusal_reason=refusal_reason,
            citations=chunks if (not is_refusal and is_domain_match) else [],
            guardrails=guard_report,
            latency=waterfall,
            harness_trace=trace,
            strategy_used=req.chunking_strategy,
            stt_provider_used=stt_provider_used
        )

orchestrator = PipelineOrchestrator()
