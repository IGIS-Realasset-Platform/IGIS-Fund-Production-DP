import pandas as pd

file_path = "/Users/jkjeon2025/Library/Mobile Documents/com~apple~CloudDocs/JK x IGIS/기획추진/IFPDP/IOTA Seoul/IOTA Seoul 펀드 구조_Bridge stage.xlsx"
df = pd.read_excel(file_path, sheet_name=0)

print("\n--- Rows 0 to 28 ---")
for i, row in df.iterrows():
    if 0 <= i <= 28:
        row_str = " | ".join([str(x) for x in row.values if not pd.isna(x)])
        print(f"Row {i}: {row_str}")

