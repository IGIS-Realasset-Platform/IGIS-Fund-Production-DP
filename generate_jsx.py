import pandas as pd
import math

df = pd.read_excel('/Users/jkjeon2025/Downloads/421 참고.xlsx', sheet_name=0)

total_amount = 323000

tranches = ['A종 수익증권', 'B종 수익증권', 'C종 수익증권', 'C-1 수익증권']

output = "                                <tbody className=\"text-[13px] text-[#E5E5E5]\">\n"

for t in tranches:
    idx = df[df['Unnamed: 1'] == t].index[0]
    # find the next '소계'
    subtotal_idx = df.iloc[idx:].index[df.iloc[idx:]['Unnamed: 4'] == '소계'][0]
    
    sub_df = df.iloc[idx:subtotal_idx]
    
    sub_total = df.iloc[subtotal_idx]['Unnamed: 9'] / 1000000
    
    # print rows
    rowspan = len(sub_df) + 1
    
    for i in range(len(sub_df)):
        row = sub_df.iloc[i]
        name = str(row['Unnamed: 4']).strip()
        amt = row['Unnamed: 9'] / 1000000
        
        tr_class = "border-b border-[#444]"
        
        # Color specific ones based on previous code or just default
        # E.g. 이지스자산운용 is #5da0e7, KT에스테이트 is #3aaab3, 삼성물산/디에스/NH is #cd879c
        color = ""
        bg_color = ""
        text_color = ""
        if "이지스" in name:
            bg_color = "bg-[#5da0e7]/20"
            text_color = "text-[#5da0e7]"
            color = "text-[#5da0e7]"
        elif "케이티에스테이트" in name:
            bg_color = "bg-[#3aaab3]/20"
            text_color = "text-[#3aaab3]"
            color = "text-[#3aaab3]"
        elif "삼성물산" in name or "디에스클러스터" in name or "NH투자증권" in name:
            bg_color = "bg-[#cd879c]/20"
            text_color = "text-[#cd879c]"
            color = "text-[#cd879c]"
        
        pct_tranche = amt / sub_total * 100
        pct_total = amt / total_amount * 100
        
        output += f"                                    <tr className=\"{tr_class}\">\n"
        
        if i == 0:
            tranche_display = t if t != 'C-1 수익증권' else 'C-1종 수익증권'
            output += f"                                        <td rowSpan=\"{rowspan}\" className=\"py-2 px-4 text-center font-bold text-white border-r border-[#444] bg-[#1a1a1c]\">{tranche_display}</td>\n"
        
        td1_class = f"py-2 px-4 border-r border-[#444] {bg_color} {text_color} {'font-bold' if bg_color else ''}".strip()
        output += f"                                        <td className=\"{td1_class}\">{name}</td>\n"
        
        td2_class = f"py-2 px-4 text-right {'font-bold' if bg_color else ''} {text_color} font-[Inter] tracking-tight border-r border-[#444] {bg_color}".strip()
        output += f"                                        <td className=\"{td2_class}\">{amt:,.0f}</td>\n"
        
        td3_class = f"py-2 px-4 text-right font-[Inter] tracking-tight border-r border-[#444] {bg_color} {text_color}".strip()
        output += f"                                        <td className=\"{td3_class}\">{pct_tranche:,.2f}%</td>\n"
        
        td4_class = f"py-2 px-4 text-right {'font-bold' if bg_color else ''} {text_color} font-[Inter] tracking-tight {bg_color}".strip()
        output += f"                                        <td className=\"{td4_class}\">{pct_total:,.2f}%</td>\n"
        
        output += "                                    </tr>\n"
        
    # Subtotal row
    subtotal_pct_tranche = 100.00
    subtotal_pct_total = sub_total / total_amount * 100
    
    output += f"                                    <tr className=\"border-b border-[#444] bg-[#1c1c1e]/50\">\n"
    output += f"                                        <td className=\"py-2 px-4 font-bold text-center text-[#86868B] border-r border-[#444]\">소계</td>\n"
    output += f"                                        <td className=\"py-2 px-4 text-right font-bold text-[#A1A1AA] font-[Inter] tracking-tight border-r border-[#444]\">{sub_total:,.0f}</td>\n"
    output += f"                                        <td className=\"py-2 px-4 text-right font-bold text-[#A1A1AA] font-[Inter] tracking-tight border-r border-[#444]\">{subtotal_pct_tranche:,.2f}%</td>\n"
    output += f"                                        <td className=\"py-2 px-4 text-right font-bold text-[#A1A1AA] font-[Inter] tracking-tight\">{subtotal_pct_total:,.2f}%</td>\n"
    output += f"                                    </tr>\n\n"

# Total row
output += f"                                    {'{/* Total */}'}\n"
output += f"                                    <tr className=\"bg-[#2A2A2A]\">\n"
output += f"                                        <td colSpan=\"2\" className=\"py-2 px-4 text-center font-bold text-white border-r border-[#444]\">합계</td>\n"
output += f"                                        <td className=\"py-2 px-4 text-right font-bold text-[#0A84FF] text-[14.5px] font-[Inter] tracking-tight border-r border-[#444]\">323,000</td>\n"
output += f"                                        <td className=\"py-2 px-4 text-right font-bold text-[#0A84FF] text-[14.5px] font-[Inter] tracking-tight border-r border-[#444]\">100.00%</td>\n"
output += f"                                        <td className=\"py-2 px-4 text-right font-bold text-[#0A84FF] text-[14.5px] font-[Inter] tracking-tight\">100.00%</td>\n"
output += f"                                    </tr>\n"
output += "                                </tbody>\n"

with open('new_tbody.jsx', 'w') as f:
    f.write(output)
