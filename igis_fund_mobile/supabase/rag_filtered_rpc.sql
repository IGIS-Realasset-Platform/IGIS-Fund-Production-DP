CREATE OR REPLACE FUNCTION match_rag_chunks_filtered(
  query_embedding vector(768),
  match_count int DEFAULT 10,
  vehicle_filter text DEFAULT NULL,
  tranche_filter text DEFAULT NULL,
  phase_filter text DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  source_table text,
  title text,
  metadata jsonb,
  content text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    rag_chunks.id,
    rag_chunks.source_table,
    rag_chunks.title,
    rag_chunks.metadata,
    rag_chunks.content,
    1 - (rag_chunks.embedding <=> query_embedding) AS similarity
  FROM rag_chunks
  WHERE
    (vehicle_filter IS NULL OR rag_chunks.metadata->>'vehicle_name' ILIKE '%' || vehicle_filter || '%')
    AND (tranche_filter IS NULL OR rag_chunks.metadata->>'tranche_type' ILIKE '%' || tranche_filter || '%')
    AND (phase_filter IS NULL OR rag_chunks.metadata->>'phase' ILIKE '%' || phase_filter || '%')
  ORDER BY rag_chunks.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
