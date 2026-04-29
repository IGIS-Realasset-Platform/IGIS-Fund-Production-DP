import pandas as pd

files = [
    "/Users/jkjeon2025/Library/Mobile Documents/com~apple~CloudDocs/JK x IGIS/기획추진/IFPDP/DB 취합/기업마케팅/IGIS_Corporate_Client_Master_DB_260407.xlsx",
    "/Users/jkjeon2025/Library/Mobile Documents/com~apple~CloudDocs/JK x IGIS/기획추진/IFPDP/DB 취합/기업마케팅/260402_Retention Leads DB_ver.1_고아라.xlsx"
]

xl1 = pd.ExcelFile(files[0])
df1 = xl1.parse('1. MASTER DB', nrows=6)
print("=== IGIS Master DB columns (rows 1-4) ===")
for i in range(1, 4):
    print(f"Row {i}:", list(df1.iloc[i]))

xl2 = pd.ExcelFile(files[1])
for sheet in ['1)기업 프로파일', '2)공간이용현황(니즈) 분석']:
    df2 = xl2.parse(sheet, nrows=5)
    print(f"=== Retention Leads: {sheet} ===")
    for i in range(0, 3):
        print(f"Row {i}:", list(df2.iloc[i]))
