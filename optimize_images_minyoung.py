import os
import glob
from PIL import Image

IMG_DIR = "/Users/jkjeon2025/Documents/GitHub/IOTA-Seoul/public/img"
SRC_DIR = "/Users/jkjeon2025/Documents/GitHub/IOTA-Seoul/src"

print("🚀 부장님, 이미지 다이어트 시작합니다!")

# 1. Convert Images
converted_files = {}
# 확장자 대소문자 모두 포함해서 검색
search_patterns = ['*.jpg', '*.jpeg', '*.png', '*.JPG', '*.PNG']

for ext in search_patterns:
    for img_path in glob.glob(os.path.join(IMG_DIR, '**', ext), recursive=True):
        try:
            img = Image.open(img_path)
            base, _ = os.path.splitext(img_path)
            webp_path = base + ".webp"
            
            # Save as WebP with good quality
            img.save(webp_path, "webp", quality=80)
            
            # Record for source code replacement
            old_name = os.path.basename(img_path)
            new_name = os.path.basename(webp_path)
            converted_files[old_name] = new_name
            
            print(f"✅ 변환 완료: {old_name} -> {new_name}")
        except Exception as e:
            print(f"❌ 변환 실패 {img_path}: {e}")

# 2. Update Source Code
print("\n📝 이제 React 코드에서 확장자를 .webp로 일괄 수정할게요!")
updated_files_count = 0
for root, dirs, files in os.walk(SRC_DIR):
    for file in files:
        if file.endswith(('.js', '.jsx', '.css')):
            file_path = os.path.join(root, file)
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            original_content = content
            # 코드 내의 이미지 이름 교체
            for old_name, new_name in converted_files.items():
                content = content.replace(old_name, new_name)
            
            if content != original_content:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f"🔄 코드 업데이트: {os.path.basename(file_path)}")
                updated_files_count += 1

print(f"\n🎉 작업 끝! 총 {len(converted_files)}개의 이미지를 변환하고 {updated_files_count}개의 파일을 수정했어요, 부장님!")
