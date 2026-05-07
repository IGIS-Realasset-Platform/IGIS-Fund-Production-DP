import sys

path = 'src/components/system/workspace/WorkspaceMarketing.jsx'
with open(path, 'r') as f:
    content = f.read()

# 1. Revert wrapper to a single div with the requested colors
old_wrapper = '''<div className="w-full rounded-[24px] p-[1px] bg-gradient-to-br from-[#d6efe9] via-[#82afb9] to-[#4c6e86] mb-[40px]">
                <div className="w-full h-full bg-[#262626] rounded-[23px] overflow-hidden">'''
new_wrapper = '''<div className="w-full bg-[#272726] border border-[#3c3c3c] rounded-[24px] overflow-hidden mb-[40px]">'''
content = content.replace(old_wrapper, new_wrapper)

# 2. Fix the extra closing </div> 
# Table 1 end
old_end_1 = '''                        </button>
                    </div>
                )}
                </div>
            </div>
            
            {/* 3. Pipeline 관리 */}'''
new_end_1 = '''                        </button>
                    </div>
                )}
            </div>
            
            {/* 3. Pipeline 관리 */}'''
content = content.replace(old_end_1, new_end_1)

# Table 2 end
old_end_2 = '''                        </button>
                    </div>
                )}
                </div>
            </div>
        </div>
    );'''
new_end_2 = '''                        </button>
                    </div>
                )}
            </div>
        </div>
    );'''
content = content.replace(old_end_2, new_end_2)

# 3. Change headers and backgrounds
content = content.replace('className="bg-[#1A1A1A]"', 'className="bg-[#272726]"')
content = content.replace('className="bg-[#222]"', 'className="bg-[#272726]"')
content = content.replace('bg-[#151515]', 'bg-[#272726]')
content = content.replace('bg-[#2A2A2A]', 'bg-[#272726]')

with open(path, 'w') as f:
    f.write(content)
print("Updated colors.")
