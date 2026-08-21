export interface Chunk {
  chunk_id: string;
  doc_id: string;
  content: string;
  strategy: string;
  chunk_index: number;
  char_count: number;
  word_count: number;
  metadata: Record<string, any>;
  score?: number;
}

export interface GuardrailVerdict {
  passed: boolean;
  flagged: boolean;
  score: number;
  reason: string;
  action: string;
}

export interface GroundingVerdict {
  passed: boolean;
  grounding_score: number;
  grounded_terms_count: number;
  unsupported_claims_detected: boolean;
  reason: string;
  action: string;
}

export interface GuardrailPipelineReport {
  safety: GuardrailVerdict;
  topic: GuardrailVerdict;
  grounding?: GroundingVerdict;
  all_passed: boolean;
  refusal_message?: string;
}

export interface LatencyWaterfall {
  stt_ms: number;
  guardrail_input_ms: number;
  embedding_ms: number;
  vector_search_ms: number;
  bm25_search_ms: number;
  total_retrieval_ms: number;
  generation_ms: number;
  guardrail_output_ms: number;
  total_pipeline_ms: number;
  target_met: boolean;
}

export interface HarnessTraceStep {
  step_name: string;
  status: string;
  execution_time_ms: number;
  details: Record<string, any>;
}

export interface VoiceRAGResponse {
  query: string;
  transcript: string;
  answer: string;
  is_refusal: boolean;
  refusal_reason?: string;
  citations: Chunk[];
  guardrails: GuardrailPipelineReport;
  latency: LatencyWaterfall;
  harness_trace: HarnessTraceStep[];
  strategy_used: string;
  stt_provider_used: string;
  llm_provider_used?: string;
}

export interface QueryBenchmarkResult {
  query_id: string;
  query_text: string;
  category: string;
  language: string;
  total_ms: number;
  stt_ms: number;
  retrieval_ms: number;
  generation_ms: number;
  guardrails_ms: number;
  is_refusal: boolean;
  target_met: boolean;
  answer_preview: string;
}

export interface BenchmarkSummary {
  total_queries_tested: number;
  successful_queries: number;
  target_met_count: number;
  target_met_percentage: number;
  strategy_used: string;
  p50_total_ms: number;
  p70_total_ms: number;
  p100_total_ms: number;
  mean_total_ms: number;
  min_total_ms: number;
  max_total_ms: number;
  breakdown_p50: Record<string, number>;
  breakdown_p70: Record<string, number>;
  breakdown_p100: Record<string, number>;
  query_results: QueryBenchmarkResult[];
}

export interface DocumentItem {
  doc_id: string;
  title: string;
  content: string;
  language: string;
  metadata: Record<string, any>;
}
