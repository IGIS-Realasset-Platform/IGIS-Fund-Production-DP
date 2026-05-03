import pandas as pd
import json

file_path = "/Users/jkjeon2025/Library/Mobile Documents/com~apple~CloudDocs/JK x IGIS/기획추진/IFPDP/IOTA Seoul/IOTA Seoul 펀드 구조_Bridge stage.xlsx"
try:
    # Read all sheets
    xls = pd.ExcelFile(file_path)
    for sheet in xls.sheet_names:
        df = pd.read_excel(file_path, sheet_name=sheet)
        print(f"\n--- Sheet: {sheet} ---")
        print(df.head(20).to_string())
except Exception as e:
    print("Error reading excel:", e)
