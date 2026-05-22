import re
import os

files_to_fix = [
    './src/components/system/IotaLeftNav.jsx',
    './src/components/system/SystemLeftNav.jsx',
    './src/components/system/DecisionLog.jsx',
    './src/components/system/IotaOne427.jsx',
    './src/components/system/IotaTwo816.jsx'
]

custom_navigate = """    const navigate = (path) => {
        const base = import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL.slice(0, -1) : import.meta.env.BASE_URL;
        window.history.pushState(null, '', base + (path.startsWith('/') ? path : '/' + path));
        window.dispatchEvent(new Event('popstate'));
    };"""

for filepath in files_to_fix:
    if not os.path.exists(filepath):
        continue
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Remove import
    content = re.sub(r"import\s*\{\s*useNavigate\s*\}\s*from\s*'react-router-dom';\n?", "", content)
    
    # Replace const navigate = useNavigate();
    content = re.sub(r"const\s+navigate\s*=\s*useNavigate\(\);", custom_navigate, content)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

print("Fixed react-router-dom dependencies.")
