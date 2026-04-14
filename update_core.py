import sys

filepath = sys.argv[1]
with open(filepath, 'r') as f:
    content = f.read()

if "import { useTheme }" not in content:
    content = content.replace("import SystemRightRAG", "import SystemRightRAG from './SystemRightRAG';\nimport { useTheme } from '../../context/ThemeContext';\nimport { useEffect } from 'react';\n")

if "const { isLightMode, toggleTheme } = useTheme();" not in content:
    content = content.replace("export default function SystemCore() {", "export default function SystemCore() {\n    const { isLightMode, toggleTheme } = useTheme();\n    useEffect(() => {\n        if (isLightMode) toggleTheme();\n    }, [isLightMode, toggleTheme]);\n")


with open(filepath, 'w') as f:
    f.write(content)
print(f"Processed {filepath}")
