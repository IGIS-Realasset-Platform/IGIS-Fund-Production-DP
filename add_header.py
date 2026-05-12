with open('src/components/system/shared/Fund421DetailCard.jsx', 'r') as f:
    content = f.read()

# Fix signature
content = content.replace("const Fund421DetailCard = ({ id, vehicleId, title, totalAmountStr, data }) => {", "const Fund421DetailCard = ({ id, vehicleId, title, totalAmountStr, data, toggleContent, onInstClick }) => {")

# Add header UI
header_ui = """        <div id={id} className="mb-12">
            <div className="flex justify-between items-end mb-[14px]">
                <div className="flex flex-col gap-[2px]">
                    <h3 className="text-[24px] font-bold text-white tracking-tight leading-none">{title}</h3>
                    {totalAmountStr && <span className="text-[14px] text-[#A1A1AA] tracking-tight">{totalAmountStr}</span>}
                </div>
                <div className="flex flex-col items-end gap-1">
                    {toggleContent && toggleContent}
                </div>
            </div>"""

content = content.replace('        <div id={id} className="mb-12">\n            <div className="flex justify-between items-end mb-[14px]">\n                <h2 className="text-[24px] font-bold text-white tracking-tight">{title}</h2>\n            </div>', header_ui)

with open('src/components/system/shared/Fund421DetailCard.jsx', 'w') as f:
    f.write(content)

