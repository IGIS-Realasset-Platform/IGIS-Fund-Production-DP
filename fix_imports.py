with open('src/components/system/workspace/WorkspaceFund.jsx', 'r') as f:
    content = f.read()
if "import Fund421DetailCard" not in content:
    content = content.replace("import { fetchWithRetry } from '../../../utils/fetchWithRetry';", "import { fetchWithRetry } from '../../../utils/fetchWithRetry';\nimport Fund421DetailCard from '../shared/Fund421DetailCard';")
with open('src/components/system/workspace/WorkspaceFund.jsx', 'w') as f:
    f.write(content)

with open('src/components/system/SystemFund421.jsx', 'r') as f:
    content = f.read()
if "import Fund421DetailCard" not in content:
    content = content.replace("import { fetchWithRetry } from '../../utils/fetchWithRetry';", "import { fetchWithRetry } from '../../utils/fetchWithRetry';\nimport Fund421DetailCard from './shared/Fund421DetailCard';")
with open('src/components/system/SystemFund421.jsx', 'w') as f:
    f.write(content)
