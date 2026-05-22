import 'package:flutter/material.dart';

ThemeData buildAppTheme() {
  const seed = Color(0xFF4C82FF); // Web platform --blue

  return ThemeData(
    useMaterial3: true,
    colorScheme: ColorScheme.fromSeed(
      seedColor: seed,
      brightness: Brightness.dark,
      primary: seed,
    ),
    scaffoldBackgroundColor: const Color(0xFF1D1D1B), // Web platform --bg
    appBarTheme: const AppBarTheme(
      centerTitle: false,
      backgroundColor: Color(0xFF1D1D1B),
      foregroundColor: Color(0xFFF4F4F1), // Web platform --text
      elevation: 0,
    ),
    navigationBarTheme: NavigationBarThemeData(
      backgroundColor: const Color(0xFF242423), // Web platform --panel
      indicatorColor: seed.withOpacity(0.2),
      iconTheme: WidgetStateProperty.resolveWith((states) {
        final selected = states.contains(WidgetState.selected);
        return IconThemeData(
          color: selected ? seed : const Color(0xFF9A9A98), // Web platform --muted
        );
      }),
      labelTextStyle: WidgetStateProperty.resolveWith((states) {
        final selected = states.contains(WidgetState.selected);
        return TextStyle(
          color: selected ? seed : const Color(0xFF9A9A98),
          fontSize: 12,
          fontWeight: selected ? FontWeight.w700 : FontWeight.w500,
        );
      }),
    ),
    cardTheme: CardThemeData(
      color: const Color(0xFF242423),
      elevation: 0,
      margin: EdgeInsets.zero,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16), // Web platform style
        side: const BorderSide(color: Color(0xFF3A3A39)), // Web platform --line
      ),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: const Color(0xFF20201F), // Web platform --panel-2
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(9), // Web platform --radius-sm
        borderSide: const BorderSide(color: Color(0xFF3A3A39)),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(9),
        borderSide: const BorderSide(color: Color(0xFF3A3A39)),
      ),
    ),
    chipTheme: const ChipThemeData(
      backgroundColor: Color(0xFF20201F),
      selectedColor: seed,
      labelStyle: TextStyle(color: Color(0xFFF4F4F1)),
      side: BorderSide(color: Color(0xFF3A3A39)),
    ),
    floatingActionButtonTheme: const FloatingActionButtonThemeData(
      backgroundColor: seed,
      foregroundColor: Colors.white,
    ),
  );
}
