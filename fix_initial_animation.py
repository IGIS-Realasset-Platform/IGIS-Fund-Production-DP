import sys

path = 'src/components/system/LogWriteBox.jsx'
with open(path, 'r') as f:
    content = f.read()

old_code = """                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}"""
                            
new_code = """                        <motion.div
                            initial={false}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}"""

if old_code in content:
    content = content.replace(old_code, new_code)
    with open(path, 'w') as f:
        f.write(content)
    print("Disabled initial opening animation.")
else:
    print("Could not find the target code.")

