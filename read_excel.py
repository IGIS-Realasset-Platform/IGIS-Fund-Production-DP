import pandas as pd
import json

file_path = "/Users/jkjeon2025/Library/Mobile Documents/com~apple~CloudDocs/JK x IGIS/기획추진/IFPDP/DB 취합/CM CRM (원드라이브 참고)/Investor List_240826.xlsx"
try:
    df = pd.read_excel(file_path, sheet_name=None)
    for sheet_name, sheet_df in df.items():
        print(f"Sheet: {sheet_name}")
        print(f"Columns: {sheet_df.columns.tolist()}")
        print(f"First 5 rows:")
        print(sheet_df.head(5).to_string())
        print("-" * 50)
except Exception as e:
    print(f"Error reading file: {e}")
