import pandas as pd

try:
    df = pd.read_excel('/Users/jkjeon2025/Downloads/Investor List_240826.xlsx', sheet_name='MASTER')
    
    # Let's search for rows that might be 427 Tr.B
    # We will print rows where any column contains '427' or 'Tr.B'
    for index, row in df.iterrows():
        row_str = ' | '.join(str(x) for x in row.values)
        if '427' in row_str and 'Tr.B' in row_str:
            print(row_str)
except Exception as e:
    print(e)
