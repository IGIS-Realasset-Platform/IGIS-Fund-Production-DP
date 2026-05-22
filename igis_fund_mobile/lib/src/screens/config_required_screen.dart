import 'package:flutter/material.dart';

class ConfigRequiredScreen extends StatelessWidget {
  const ConfigRequiredScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: SafeArea(
        child: Padding(
          padding: EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                'Supabase 설정이 필요합니다.',
                style: TextStyle(fontSize: 24, fontWeight: FontWeight.w700),
              ),
              SizedBox(height: 12),
              Text(
                '앱 실행 때 SUPABASE_URL과 SUPABASE_ANON_KEY를 dart-define 값으로 전달해야 합니다.',
                style: TextStyle(fontSize: 15, height: 1.5),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
