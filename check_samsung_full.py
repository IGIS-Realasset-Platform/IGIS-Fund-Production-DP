import pandas as pd
import numpy as np

file_path = "/Users/jkjeon2025/Library/Mobile Documents/com~apple~CloudDocs/JK x IGIS/기획추진/IFPDP/DB 취합/CM CRM (원드라이브 참고)/Investor List_240826.xlsx"
df = pd.read_excel(file_path, sheet_name=None)
samsung_sheet = [k for k in df.keys() if "삼성화재" in k][0]
sheet_df = df[samsung_sheet]
# Print first 20 rows, all columns, dropping empty columns
sheet_df = sheet_df.dropna(axis=1, how='all')
print(sheet_df.head(20).to_string())
