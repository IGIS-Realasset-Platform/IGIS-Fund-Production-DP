import sys

path = 'src/components/system/workspace/WorkspacePm.jsx'
with open(path, 'r') as f:
    content = f.read()

start_marker = "            {/* Decision Log */}"
end_marker = """                    </div>
                ))}
            </div>

        </div>
    );
}"""

if start_marker in content and end_marker in content:
    start_idx = content.find(start_marker)
    end_idx = content.find(end_marker) + len(end_marker)
    
    # We want to keep the closing tags `        </div>\n    );\n}`
    replacement = """        </div>
    );
}"""
    
    new_content = content[:start_idx] + replacement
    with open(path, 'w') as f:
        f.write(new_content)
    print("Decision Log removed.")
else:
    print("Could not find markers.")

