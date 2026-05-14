import os
import re

path = 'src/components/system/LogWriteBox.jsx'
with open(path, 'r') as file:
    content = file.read()

# 1. Add Import
if "import { executeWithTimeout }" not in content:
    content = content.replace("import { supabase } from '../../utils/supabaseClient';", "import { supabase } from '../../utils/supabaseClient';\nimport { executeWithTimeout } from '../../utils/supabaseHelper';")

# 2. Add draft restoring logic inside useEffect
draft_logic = """
    useEffect(() => {
        if (!editMode) {
            try {
                const draft = localStorage.getItem('iota_log_draft');
                if (draft) {
                    const parsed = JSON.parse(draft);
                    if (parsed.title) setTitle(parsed.title);
                    if (parsed.content) setContent(parsed.content);
                    localStorage.removeItem('iota_log_draft');
                }
            } catch(e) {}
        }
    }, [editMode]);
"""
if "localStorage.getItem('iota_log_draft')" not in content:
    # insert it right after the first useEffect
    content = content.replace("    // Edit Mode Initialization", draft_logic + "\n    // Edit Mode Initialization")

# 3. Replace all `await supabase.from` mutations with timeout wrapper
content = re.sub(r'await (supabase\.from\([^)]+\)\.(?:update|insert|delete)[^;\n]+);', r'await executeWithTimeout(\1);', content)

# 4. Multiline insert for stakeholder master in `registerMasterStakeholder` and `processSubmit`
# In `processSubmit`:
sh_target_submit = """const { error: masterError } = await supabase.from('iota_stakeholder_master').insert({
                        company_name: companyQuery,
                        contact_name: contactQuery || null,
                        role_category: stakeholderCat || null
                    });"""
sh_replace_submit = """const { error: masterError } = await executeWithTimeout(supabase.from('iota_stakeholder_master').insert({
                        company_name: companyQuery,
                        contact_name: contactQuery || null,
                        role_category: stakeholderCat || null
                    }));"""
content = content.replace(sh_target_submit, sh_replace_submit)

sh_target_submit2 = """const { error: shError } = await supabase.from('iota_seoul_log_stakeholders').insert({
                    sh_id: `sh_${logId}`,
                    log_id: logId,
                    sh_name: combinedName || null,
                    role_category: stakeholderCat
                });"""
sh_replace_submit2 = """const { error: shError } = await executeWithTimeout(supabase.from('iota_seoul_log_stakeholders').insert({
                    sh_id: `sh_${logId}`,
                    log_id: logId,
                    sh_name: combinedName || null,
                    role_category: stakeholderCat
                }));"""
content = content.replace(sh_target_submit2, sh_replace_submit2)

sh_target_submit3 = """const { error: linkError } = await supabase.from('iota_seoul_log_links').insert({
                link_id: `link_${logId}`,
                log_id: logId,
                proj_id: projectId,
                relation_type: 'direct_input'
            });"""
sh_replace_submit3 = """const { error: linkError } = await executeWithTimeout(supabase.from('iota_seoul_log_links').insert({
                link_id: `link_${logId}`,
                log_id: logId,
                proj_id: projectId,
                relation_type: 'direct_input'
            }));"""
content = content.replace(sh_target_submit3, sh_replace_submit3)

sh_target_submit4 = """const { error: logError } = await supabase.from('iota_seoul_logs').insert({
                    ...logData,
                    log_id: logId,
                    writer_staff_id: writerId,
                    writer_name: writerName,
                    input_status: 'submitted',
                    source_system: workspaceCode === 'WS_PM' ? 'workspace_pm_form' : 'decision_log_form',
                });"""
sh_replace_submit4 = """const { error: logError } = await executeWithTimeout(supabase.from('iota_seoul_logs').insert({
                    ...logData,
                    log_id: logId,
                    writer_staff_id: writerId,
                    writer_name: writerName,
                    input_status: 'submitted',
                    source_system: workspaceCode === 'WS_PM' ? 'workspace_pm_form' : 'decision_log_form',
                }));"""
content = content.replace(sh_target_submit4, sh_replace_submit4)


# In `registerMasterStakeholder` it already has a Promise.race, let's leave it as is, or replace it if it's there.
# It currently has:
# const insertPromise = supabase.from('iota_stakeholder_master').insert({
# ...
# const result = await Promise.race([insertPromise, timeoutPromise]);
# We can leave this one since it already has a timeout!

# 5. Update catch blocks for `processSubmit`
catch_target = """        } catch (error) {
            console.error('Error saving log:', error);
            alert('저장 중 오류가 발생했습니다.');"""
catch_replace = """        } catch (error) {
            console.error('Error saving log:', error);
            alert('서버 통신 지연이 발생했습니다. 작성 내용을 안전하게 임시 보관하고 새로고침합니다.');
            localStorage.setItem('iota_log_draft', JSON.stringify({ title, content }));
            window.location.reload();"""
content = content.replace(catch_target, catch_replace)

with open(path, 'w') as file:
    file.write(content)

print("Done updating LogWriteBox.jsx")
