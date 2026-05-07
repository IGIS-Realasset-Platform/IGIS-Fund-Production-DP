import sys

path = 'src/components/system/LogWriteBox.jsx'
with open(path, 'r') as f:
    content = f.read()

old_text = '<span className="text-[#bcdbdb] font-bold text-[15px]">주요 공유사항 또는 협업 및 논의가 필요한 내용을 등록하세요.</span>'
new_text = '<span className="text-[#bcdbdb] font-bold text-[16px]">주요 공유사항, 협업 및 논의가 필요한 내용을 등록하세요.</span>'

if old_text in content:
    content = content.replace(old_text, new_text)
    with open(path, 'w') as f:
        f.write(content)
    print("LogWriteBox text updated.")
else:
    print("Could not find the original text.")

