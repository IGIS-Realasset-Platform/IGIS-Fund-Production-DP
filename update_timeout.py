import os
import re

files = [
    'WorkspacePm.jsx',
    'WorkspaceDevelopment.jsx',
    'WorkspaceMarketing.jsx',
    'WorkspaceFinancing.jsx',
    'WorkspaceIpr.jsx',
    'WorkspaceFund.jsx',
    'WorkspaceDigital.jsx'
]

base_dir = 'src/components/system/workspace'

for f in files:
    path = os.path.join(base_dir, f)
    with open(path, 'r') as file:
        content = file.read()
    
    if "import { executeWithTimeout }" not in content:
        content = content.replace("import { supabase } from '../../utils/supabaseClient';", "import { supabase } from '../../utils/supabaseClient';\nimport { executeWithTimeout } from '../../utils/supabaseHelper';")

    content = re.sub(r'await (supabase\.from\([^)]+\)\.(?:update|insert|delete)[^;\n]+);', r'await executeWithTimeout(\1);', content)

    sh_target = """await supabase.from('iota_stakeholder_master').insert({
                company_name: companyQuery,
                contact_name: contactQuery || null,
                role_category: stakeholderCat || null
            });"""
    sh_replace = """await executeWithTimeout(supabase.from('iota_stakeholder_master').insert({
                company_name: companyQuery,
                contact_name: contactQuery || null,
                role_category: stakeholderCat || null
            }));"""
    content = content.replace(sh_target, sh_replace)

    catch_target = """        } catch (e) {
            console.warn('Deleting from local storage fallback due to error:', e);"""
    
    catch_replace = """        } catch (e) {
            console.warn('Deleting from local storage fallback due to error:', e);
            alert('서버 통신 지연이 감지되어 임시 보관 처리 후 새로고침합니다.');
            window.location.reload();"""
            
    content = content.replace(catch_target, catch_replace)

    with open(path, 'w') as file:
        file.write(content)

print("Done")
