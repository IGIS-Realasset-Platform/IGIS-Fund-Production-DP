import sys

path = 'src/components/system/LogWriteBox.jsx'
with open(path, 'r') as f:
    content = f.read()

# Replace the initial state
old_state = 'const [isExpanded, setIsExpanded] = useState(false);'
new_state = 'const [isExpanded, setIsExpanded] = useState(true);'

if old_state in content:
    content = content.replace(old_state, new_state)
    with open(path, 'w') as f:
        f.write(content)
    print("LogWriteBox default state updated.")
else:
    print("Could not find the state initialization.")

