import pandas as pd

file_path = "/Users/jkjeon2025/Library/Mobile Documents/com~apple~CloudDocs/JK x 일/기획추진/IFPDP/DB 취합/CM CRM (원드라이브 참고)/Investor List_240826.xlsx"
# Wait, the path is JK x IGIS, not JK x 일
file_path = "/Users/jkjeon2025/Library/Mobile Documents/com~apple~CloudDocs/JK x IGIS/기획추진/IFPDP/DB 취합/CM CRM (원드라이브 참고)/Investor List_240826.xlsx"

try:
    df = pd.read_excel(file_path, sheet_name=None)
    target_sheet = [k for k in df.keys() if "삼성화재" in k]
    if target_sheet:
        print(f"Found sheet: {target_sheet[0]}")
        sheet_df = df[target_sheet[0]]
        print(sheet_df.head(20).to_string())
    else:
        print("No sheet for 삼성화재")
except Exception as e:
    print(f"Error: {e}")
