import sys
import re

path = 'src/components/system/workspace/WorkspaceFinancing.jsx'
with open(path, 'r') as f:
    lines = f.readlines()

# find where VehicleDetailCard for 816 ends
# It should be around `id="section-816"`
last_816_index = -1
for i, line in enumerate(lines):
    if "id=\"section-816\"" in line:
        last_816_index = i

print(f"last_816_index: {last_816_index}")
if last_816_index != -1:
    # Now find the end of the VehicleDetailCard definition (it's a self-closing tag or has a closing tag?)
    # Usually <VehicleDetailCard ... /> is self-closing.
    # Let's find the `/>` after last_816_index
    end_of_816 = -1
    for i in range(last_816_index, len(lines)):
        if "/>" in lines[i]:
            end_of_816 = i
            break
    print(f"end_of_816: {end_of_816}")

    if end_of_816 != -1:
        # Now find the line with `)}` that closes the main conditional
        end_conditional = -1
        for i in range(len(lines)-1, -1, -1):
            if ")} " in lines[i] or ")}\n" in lines[i] or ")}" in lines[i]:
                end_conditional = i
                break
        print(f"end_conditional: {end_conditional}")
        
        # We need to replace everything between end_of_816 + 1 and end_conditional with our ui_blocks
        # Let's print the lines between to be sure
        print("Lines to delete:")
        for i in range(end_of_816 + 1, min(end_of_816 + 10, end_conditional)):
            print(f"{i}: {lines[i].strip()}")
