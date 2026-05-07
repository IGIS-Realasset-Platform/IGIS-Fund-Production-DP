import sys

path = 'src/components/system/workspace/WorkspaceMarketing.jsx'
with open(path, 'r') as f:
    content = f.read()

# 1. Table 1 (Task 관리) wrapper update
old_table_1_wrapper = '<div className="w-full bg-[#262626] border border-[#3c3c3c] rounded-[24px] overflow-hidden mb-[40px]">'
new_table_1_wrapper = '''<div className="w-full rounded-[24px] p-[1px] bg-gradient-to-br from-[#d6efe9] via-[#82afb9] to-[#4c6e86] mb-[40px]">
                <div className="w-full h-full bg-[#262626] rounded-[23px] overflow-hidden">'''

# 2. Table 2 (Pipeline 관리) wrapper update
old_table_2_wrapper = '<div className="w-full bg-[#1A1A1A] border border-[#333] rounded-[24px] overflow-hidden mb-[40px]">'
new_table_2_wrapper = '''<div className="w-full rounded-[24px] p-[1px] bg-gradient-to-br from-[#d6efe9] via-[#82afb9] to-[#4c6e86] mb-[40px]">
                <div className="w-full h-full bg-[#262626] rounded-[23px] overflow-hidden">'''

content = content.replace(old_table_1_wrapper, new_table_1_wrapper)
content = content.replace(old_table_2_wrapper, new_table_2_wrapper)

# 3. Add closing </div> for the new wrappers
# Since we replaced `<div ...>` with `<div ...><div ...>`, we need to add a closing `</div>` right after `</div>` of the tables.
# Let's do this with regex.
import re

# We will just replace `</div>` before `}` with `</div></div>` for the table blocks.
# It is safer to use a more specific string replacement.
# Let's look at the end of each block.

# End of Table 1 block:
old_end_1 = '''                        </button>
                    </div>
                )}
            </div>
            
            {/* 3. Pipeline 관리 */}'''
new_end_1 = '''                        </button>
                    </div>
                )}
                </div>
            </div>
            
            {/* 3. Pipeline 관리 */}'''
content = content.replace(old_end_1, new_end_1)

# End of Table 2 block:
old_end_2 = '''                        </button>
                    </div>
                )}
            </div>
        </div>
    );'''
new_end_2 = '''                        </button>
                    </div>
                )}
                </div>
            </div>
        </div>
    );'''
content = content.replace(old_end_2, new_end_2)

# Fix double comments: `{/* 3. Pipeline 관리 */} {/* 3. Pipeline 관리 */}` if present
content = content.replace('{/* 3. Pipeline 관리 */} {/* 3. Pipeline 관리 */}', '{/* 3. Pipeline 관리 */}')

with open(path, 'w') as f:
    f.write(content)
print("Updated table wrappers.")
