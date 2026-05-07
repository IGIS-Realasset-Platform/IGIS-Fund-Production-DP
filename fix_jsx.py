import sys

path = 'src/components/system/workspace/WorkspaceFinancing.jsx'
with open(path, 'r') as f:
    content = f.read()

# I will find the first `</>` that is before my injected elements
# My injected elements start with `<div className="w-full h-[60px]"></div>`
# Let's remove the `</>` that is just above it, and add it right above `)}`

marker = "</>\n\n                    <div className=\"w-full h-[60px]\"></div>"
if marker in content:
    # Remove the `</>`
    content = content.replace(marker, "\n                    <div className=\"w-full h-[60px]\"></div>")
    
    # Add `</>` right before `)}` at the end
    content = content.replace("            )}\n\n        </div>", "                </>\n            )}\n\n        </div>")

    with open(path, 'w') as f:
        f.write(content)
    print("Fixed JSX syntax error.")
else:
    print("Marker not found.")
