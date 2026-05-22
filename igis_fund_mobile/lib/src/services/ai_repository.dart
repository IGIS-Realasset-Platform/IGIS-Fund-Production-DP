import 'package:supabase_flutter/supabase_flutter.dart';

class AiSource {
  final String sourceTable;
  final String title;
  final double similarity;

  AiSource({required this.sourceTable, required this.title, required this.similarity});

  factory AiSource.fromMap(Map<String, dynamic> map) {
    return AiSource(
      sourceTable: map['source_table']?.toString() ?? 'unknown',
      title: map['title']?.toString() ?? '제목 없음',
      similarity: (map['similarity'] as num?)?.toDouble() ?? 0.0,
    );
  }
}

class AiResponse {
  final String answer;
  final List<AiSource> sources;

  AiResponse({required this.answer, required this.sources});
}

class AiRepository {
  final SupabaseClient _supabase;

  AiRepository(this._supabase);

  Future<AiResponse> askQuestion(String query) async {
    try {
      final res = await _supabase.functions.invoke(
        'ai-rag-chat',
        body: {'query': query},
      );

      final data = res.data;
      if (data == null || data is! Map<String, dynamic>) {
        throw Exception('올바르지 않은 응답 형식입니다.');
      }

      if (data.containsKey('error')) {
        throw Exception(data['error']);
      }

      final answer = data['answer']?.toString() ?? '답변을 생성하지 못했습니다.';
      final sourcesList = (data['sources'] as List<dynamic>?) ?? [];
      final sources = sourcesList
          .whereType<Map<String, dynamic>>()
          .map((m) => AiSource.fromMap(m))
          .toList();

      return AiResponse(answer: answer, sources: sources);
    } catch (e) {
      return AiResponse(
        answer: 'AI 검색 중 오류가 발생했습니다: $e',
        sources: [],
      );
    }
  }
}
