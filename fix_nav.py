import re

def fix_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if 'import { useNavigate }' not in content:
        content = content.replace('import React', "import { useNavigate } from 'react-router-dom';\nimport React")
        content = re.sub(r'(export default function Iota[a-zA-Z0-9]+\([^)]*\)\s*\{)', r'\1\n    const navigate = useNavigate();', content)
        
    # Replacements
    # window.location.href = `${import.meta.env.BASE_URL}platform/iotaseoul/workspace/digital?card=01`; -> navigate(`/platform/iotaseoul/workspace/digital?card=01`)
    content = re.sub(r'window\.location\.href\s*=\s*`\$\{import\.meta\.env\.BASE_URL\}([^`]+)`', r'navigate(`/\1`)', content)
    
    # window.location.href = base.endsWith('/') ? `${base}platform/iotaseoul/workspace/marketing` : `${base}/platform/iotaseoul/workspace/marketing`; 
    # -> navigate('/platform/iotaseoul/workspace/marketing');
    content = re.sub(r'window\.location\.href\s*=\s*base\.endsWith[^;]+;', r"navigate('/platform/iotaseoul/workspace/marketing');", content)
    
    # window.location.href = base.endsWith('/') ? `${base}platform/iotaseoul/workspace/digital` : `${base}/platform/iotaseoul/workspace/digital`;
    content = re.sub(r'window\.location\.href\s*=\s*base\.endsWith[^;]+digital`;', r"navigate('/platform/iotaseoul/workspace/digital');", content)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

fix_file('./src/components/system/IotaOne427.jsx')
fix_file('./src/components/system/IotaTwo816.jsx')
