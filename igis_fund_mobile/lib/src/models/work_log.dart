import 'log_visibility.dart';
import 'member_profile.dart';

class WorkLog {
  const WorkLog({
    required this.id,
    required this.writerStaffId,
    required this.writerName,
    required this.rawText,
    required this.summary,
    required this.workDate,
    required this.createdAt,
    required this.metadata,
    required this.stakeholders,
  });

  final String id;
  final String writerStaffId;
  final String writerName;
  final String rawText;
  final String summary;
  final DateTime? workDate;
  final DateTime? createdAt;
  final Map<String, dynamic> metadata;
  final List<LogStakeholder> stakeholders;

  String get title {
    final metadataTitle = metadata['title']?.toString().trim();
    if (metadataTitle != null && metadataTitle.isNotEmpty) {
      return metadataTitle;
    }
    if (summary.isNotEmpty) {
      return summary.split('\n').first.trim();
    }
    final firstLine = rawText.split('\n').first.trim();
    return firstLine.isEmpty ? '제목 없음' : firstLine;
  }

  String get workspaceLabel {
    return metadata['workspace_label']?.toString() ?? '공통';
  }

  String get workspaceCode {
    return metadata['workspace_code']?.toString() ?? '';
  }

  String get status {
    return metadata['issue_status']?.toString() ?? '진행중';
  }

  String get priority {
    return metadata['priority']?.toString() ?? '중간';
  }

  String get triageType {
    return metadata['triage_type']?.toString() ?? '공유';
  }

  String get projectName {
    if (metadata.containsKey('project_name')) {
      final name = metadata['project_name'].toString();
      if (name == 'IOTA 427') return '427 PFV';
      if (name == 'IOTA 816') return '816 PFV';
      return name;
    }
    final text = '${metadata['workspace_label'] ?? ''} ${metadata['source_project_text'] ?? ''}';
    if (text.contains('816') || text.contains('서울 2') || text.contains('IOTA 2') || text.contains('Two')) {
      return '816 PFV';
    }
    if (text.contains('421')) return '421 Fund';
    return 'IOTA 공통';
  }

  String get cellName {
    if (metadata.containsKey('workspace_label')) {
      final lbl = metadata['workspace_label'].toString();
      if (lbl.contains('사업 PM') || lbl.contains('사업PM')) return '사업PM';
      if (lbl.contains('파이낸싱')) return '파이낸싱-LFC';
      if (lbl.contains('개발솔루션')) return '개발솔루션-DSC';
      if (lbl.contains('기업마케팅')) return '기업마케팅-EMC';
      if (lbl.contains('공간솔루션') || lbl.contains('상품/디지털') || lbl.contains('상품·디지털')) return '공간솔루션-SSC';
      if (lbl.contains('펀드운용')) return '펀드운용-KAM';
      if (lbl.contains('IPR')) return 'IPR';
    }
    
    // Legacy logs fallback (before workspace feature)
    if (writerName == '박준호') return '파이낸싱-LFC';
    if (['이철승', '윤관식', '우형석', '정조민'].contains(writerName)) return '사업PM';

    return stakeholderRoleCategory.isEmpty || stakeholderRoleCategory == 'IGIS 내부인력' 
        ? '기타' 
        : stakeholderRoleCategory;
  }

  bool get isMajorWork {
    return priority == '높음' ||
        triageType == '의사결정' ||
        triageType == '리스크 판단';
  }

  String get stakeholderName {
    return stakeholders.isEmpty ? '' : stakeholders.first.name;
  }

  String get stakeholderRoleCategory {
    return stakeholders.isEmpty ? '' : stakeholders.first.roleCategory;
  }

  LogVisibilitySetting get visibility {
    final perms = metadata['permissions'];
    if (perms is Map) {
      return LogVisibilitySetting.fromMap(perms.cast<String, dynamic>());
    }
    return LogVisibilitySetting.all();
  }

  String get visibilityLabel {
    final v = visibility;
    if (v.groups.isEmpty && v.individuals.isEmpty) return '전체 공개';
    if (v.groups.contains('각 워크스페이스')) return '워크스페이스';
    if (v.groups.contains('master') || v.groups.contains('director')) return '관리자';
    if (v.individuals.isNotEmpty) return '지정 인원';
    if (v.groups.isNotEmpty) return '조직';
    return '제한됨';
  }

  bool get hasExplicitVisibility {
    final v = visibility;
    return v.groups.isNotEmpty || v.individuals.isNotEmpty;
  }

  bool isVisibleTo(MemberProfile? member) {
    if (!hasExplicitVisibility) return true;

    final myEmail = member?.email ?? '';
    final checkName = member?.name ?? '';

    if (writerStaffId.trim() == myEmail || writerName.trim() == checkName) {
      return true;
    }

    final v = visibility;
    if (v.individuals.contains(checkName)) {
      return true;
    }

    if (v.groups.isNotEmpty && member != null) {
      if (v.groups.contains('각 워크스페이스')) return true;
      if (v.groups.contains(member.roleCode)) return true;
      if (member.orgName != null &&
          v.groups.any((group) => member.belongsToOrg(group))) {
        return true;
      }
      
      // Legacy overrides from web platform
      if (v.groups.contains('PO') && checkName == '이철승') return true;
      if (v.groups.contains('Sub-PO') && ['윤관식', '정조민', '우형석'].contains(checkName)) return true;
    }

    return false;
  }

  List<Map<String, dynamic>> get comments {
    final value = metadata['comments'];
    if (value is List) {
      return value.whereType<Map>().map((item) {
        return item.map((key, value) => MapEntry(key.toString(), value));
      }).toList();
    }
    return const [];
  }

  List<LogComment> get commentItems {
    return comments.map(LogComment.fromMap).toList();
  }

  factory WorkLog.fromMap(Map<String, dynamic> map) {
    final metadataValue = map['metadata'];
    final parsedMetadata = metadataValue is Map
        ? metadataValue.map((key, value) => MapEntry(key.toString(), value))
        : <String, dynamic>{};
    final stakeholdersValue = map['iota_seoul_log_stakeholders'];
    final parsedStakeholders = stakeholdersValue is List
        ? stakeholdersValue
            .whereType<Map>()
            .map(LogStakeholder.fromMap)
            .toList()
        : const <LogStakeholder>[];

    return WorkLog(
      id: (map['log_id'] ?? '').toString(),
      writerStaffId: (map['writer_staff_id'] ?? '').toString(),
      writerName: (map['writer_name'] ?? '익명').toString(),
      rawText: (map['raw_text'] ?? '').toString(),
      summary: (map['summary'] ?? '').toString().trim(),
      workDate: DateTime.tryParse((map['work_date'] ?? '').toString()),
      createdAt: DateTime.tryParse((map['created_at'] ?? '').toString()),
      metadata: parsedMetadata,
      stakeholders: parsedStakeholders,
    );
  }
}

class LogStakeholder {
  const LogStakeholder({
    required this.name,
    required this.roleCategory,
  });

  final String name;
  final String roleCategory;

  factory LogStakeholder.fromMap(Map<dynamic, dynamic> map) {
    return LogStakeholder(
      name: (map['sh_name'] ?? '').toString(),
      roleCategory: (map['role_category'] ?? '').toString(),
    );
  }
}

class LogComment {
  const LogComment({
    required this.author,
    required this.text,
    required this.createdAt,
  });

  final String author;
  final String text;
  final DateTime? createdAt;

  factory LogComment.fromMap(Map<String, dynamic> map) {
    return LogComment(
      author: (map['author'] ?? '익명').toString(),
      text: (map['text'] ?? '').toString(),
      createdAt: DateTime.tryParse((map['created_at'] ?? '').toString()),
    );
  }
}
