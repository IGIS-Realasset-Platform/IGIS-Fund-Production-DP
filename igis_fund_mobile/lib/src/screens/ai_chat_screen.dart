import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:flutter_markdown/flutter_markdown.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../services/ai_repository.dart';

class ChatMessage {
  final String text;
  final bool isUser;
  final List<AiSource>? sources;

  ChatMessage({required this.text, required this.isUser, this.sources});
}

class AiChatScreen extends StatefulWidget {
  const AiChatScreen({super.key});

  @override
  State<AiChatScreen> createState() => _AiChatScreenState();
}

class _AiChatScreenState extends State<AiChatScreen> {
  final TextEditingController _textController = TextEditingController();
  final List<ChatMessage> _messages = [];
  final ScrollController _scrollController = ScrollController();
  bool _isLoading = false;
  late final AiRepository _aiRepository;

  @override
  void initState() {
    super.initState();
    _aiRepository = AiRepository(Supabase.instance.client);
    
    // 초기 환영 메시지
    _messages.add(ChatMessage(
      text: '안녕하세요! IOTA AI 검색 에이전트입니다.\n\n어떤 내용을 찾고 계신가요?',
      isUser: false,
    ));
  }

  @override
  void dispose() {
    _textController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  Future<void> _handleSubmitted(String text) async {
    final query = text.trim();
    if (query.isEmpty) return;

    _textController.clear();
    setState(() {
      _messages.add(ChatMessage(text: query, isUser: true));
      _isLoading = true;
    });
    _scrollToBottom();

    final response = await _aiRepository.askQuestion(query);

    if (mounted) {
      setState(() {
        _messages.add(ChatMessage(
          text: response.answer,
          isUser: false,
          sources: response.sources,
        ));
        _isLoading = false;
      });
      _scrollToBottom();
    }
  }

  Widget _buildMessage(ChatMessage message) {
    return Container(
      margin: const EdgeInsets.symmetric(vertical: 8.0, horizontal: 16.0),
      child: Row(
        mainAxisAlignment:
            message.isUser ? MainAxisAlignment.end : MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (!message.isUser)
            Container(
              margin: const EdgeInsets.only(right: 8.0),
              child: const CircleAvatar(
                backgroundColor: Colors.blueAccent,
                child: Icon(Icons.smart_toy, color: Colors.white, size: 20),
              ),
            ),
          Flexible(
            child: Container(
              padding: const EdgeInsets.all(12.0),
              decoration: BoxDecoration(
                color: message.isUser
                    ? Theme.of(context).colorScheme.primaryContainer
                    : Theme.of(context).colorScheme.surfaceVariant,
                borderRadius: BorderRadius.circular(16).copyWith(
                  bottomRight: message.isUser ? const Radius.circular(0) : null,
                  bottomLeft: !message.isUser ? const Radius.circular(0) : null,
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  message.isUser
                      ? Text(
                          message.text,
                          style: TextStyle(
                            color: Theme.of(context).colorScheme.onPrimaryContainer,
                          ),
                        )
                      : MarkdownBody(
                          data: message.text,
                          selectable: true,
                        ),
                  if (!message.isUser && message.sources != null && message.sources!.isNotEmpty) ...[
                    const SizedBox(height: 8),
                    Container(
                      decoration: BoxDecoration(
                        color: Theme.of(context).colorScheme.surface,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: ExpansionTile(
                        title: Text(
                          '검색 근거 (${message.sources!.length}건)',
                          style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold),
                        ),
                        tilePadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 0),
                        childrenPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                        children: message.sources!.map((s) {
                          return Padding(
                            padding: const EdgeInsets.only(bottom: 4.0),
                            child: Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Icon(Icons.check_circle_outline, size: 14, color: Colors.green),
                                const SizedBox(width: 4),
                                Expanded(
                                  child: Text(
                                    '[${s.sourceTable}] ${s.title} (정확도: ${(s.similarity * 100).toStringAsFixed(1)}%)',
                                    style: const TextStyle(fontSize: 12),
                                  ),
                                ),
                              ],
                            ),
                          );
                        }).toList(),
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ),
          if (message.isUser)
            Container(
              margin: const EdgeInsets.only(left: 8.0),
              child: const CircleAvatar(
                backgroundColor: Colors.grey,
                child: Icon(Icons.person, color: Colors.white, size: 20),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildTextComposer() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8.0, vertical: 8.0),
      decoration: BoxDecoration(
        color: Theme.of(context).scaffoldBackgroundColor,
        boxShadow: [
          BoxShadow(
            offset: const Offset(0, -1),
            blurRadius: 4,
            color: Colors.black.withOpacity(0.05),
          ),
        ],
      ),
      child: SafeArea(
        child: Row(
          children: [
            Expanded(
              child: TextField(
                controller: _textController,
                decoration: InputDecoration(
                  hintText: 'AI에게 검색을 요청하세요...',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(24.0),
                    borderSide: BorderSide.none,
                  ),
                  filled: true,
                  fillColor: Theme.of(context).colorScheme.surfaceVariant.withOpacity(0.5),
                  contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                ),
                onSubmitted: _handleSubmitted,
                textInputAction: TextInputAction.send,
              ),
            ),
            const SizedBox(width: 8.0),
            Container(
              decoration: BoxDecoration(
                color: Theme.of(context).colorScheme.primary,
                shape: BoxShape.circle,
              ),
              child: IconButton(
                icon: const Icon(Icons.send, color: Colors.white),
                onPressed: _isLoading
                    ? null
                    : () => _handleSubmitted(_textController.text),
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('AI Agent 검색'),
        elevation: 0,
      ),
      body: Stack(
        children: [
          // 배경 로고 (투명도 20%)
          Center(
            child: Opacity(
              opacity: 0.2,
              child: SvgPicture.asset(
                'assets/iota_seoul_home_v2.svg',
                width: MediaQuery.of(context).size.width * 0.7,
              ),
            ),
          ),
          
          // 채팅 목록 및 입력창
          Column(
            children: [
              Expanded(
                child: ListView.builder(
                  controller: _scrollController,
                  padding: const EdgeInsets.only(top: 8.0, bottom: 20.0),
                  itemCount: _messages.length,
                  itemBuilder: (context, index) {
                    return _buildMessage(_messages[index]);
                  },
                ),
              ),
              if (_isLoading)
                const Padding(
                  padding: EdgeInsets.all(8.0),
                  child: CircularProgressIndicator(),
                ),
              _buildTextComposer(),
            ],
          ),
        ],
      ),
    );
  }
}
