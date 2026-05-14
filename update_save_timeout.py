import os

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
    
    catch_target = """        } catch (e) {
            console.warn('Saving to local storage fallback due to error:', e);"""
    
    catch_replace = """        } catch (e) {
            console.warn('Saving to local storage fallback due to error:', e);
            alert('서버 통신 지연이 감지되어 임시 보관 처리 후 새로고침합니다.');
            window.location.reload();"""
            
    content = content.replace(catch_target, catch_replace)

    with open(path, 'w') as file:
        file.write(content)

print("Done")
