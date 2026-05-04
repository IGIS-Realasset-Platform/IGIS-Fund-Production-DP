import pandas as pd

file_path = "/Users/jkjeon2025/Library/Mobile Documents/com~apple~CloudDocs/JK x IGIS/기획추진/IFPDP/DB 취합/CM CRM (원드라이브 참고)/Investor List_240826.xlsx"
df = pd.read_excel(file_path, sheet_name=None)
print("Sheet Names:")
for name in df.keys():
    print(name)
