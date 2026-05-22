import 'package:flutter_test/flutter_test.dart';

import 'package:igis_fund_mobile/src/app.dart';

void main() {
  testWidgets('shows configuration guidance without Supabase settings', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(const IotaSeoulCftApp(isConfigured: false));

    expect(find.text('Supabase 설정이 필요합니다.'), findsOneWidget);
  });
}
