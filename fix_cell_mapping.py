import re

files = [
    'src/components/system/workspace/WorkspaceActivityLog.jsx',
    'src/components/system/LogWriteBox.jsx'
]

for file in files:
    with open(file, 'r') as f:
        content = f.read()
    
    # Original string in WorkspaceActivityLog: '김민지': '기업마케팅-EMC', '고아라': '기업마케팅-EMC', '이가현': '기업마케팅-EMC', '정수명': '기업마케팅-EMC'
    # Original string in LogWriteBox: '김민지': '기업마케팅', '고아라': '기업마케팅', '이가현': '기업마케팅', '정수명': '기업마케팅'
    
    content = content.replace(
        "'김민지': '기업마케팅-EMC', '고아라': '기업마케팅-EMC', '이가현': '기업마케팅-EMC', '정수명': '기업마케팅-EMC',",
        "'김민지': '기업마케팅-EMC', '고아라': '기업마케팅-EMC',"
    )
    content = content.replace(
        "'김현수': '상품·디지털-SSC', '현철호': '상품·디지털-SSC', '신민호': '상품·디지털-SSC',",
        "'김현수': '상품·디지털-SSC', '현철호': '상품·디지털-SSC', '신민호': '상품·디지털-SSC', '이가현': '상품·디지털-SSC', '정수명': '상품·디지털-SSC',"
    )
    
    content = content.replace(
        "'김민지': '기업마케팅', '고아라': '기업마케팅', '이가현': '기업마케팅', '정수명': '기업마케팅',",
        "'김민지': '기업마케팅', '고아라': '기업마케팅',"
    )
    content = content.replace(
        "'김현수': '상품·디지털', '현철호': '상품·디지털', '신민호': '상품·디지털',",
        "'김현수': '상품·디지털', '현철호': '상품·디지털', '신민호': '상품·디지털', '이가현': '상품·디지털', '정수명': '상품·디지털',"
    )
    
    with open(file, 'w') as f:
        f.write(content)

print("Mapping fixed")
