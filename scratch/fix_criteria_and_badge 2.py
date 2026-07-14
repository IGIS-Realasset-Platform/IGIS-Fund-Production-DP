import sys

file_path = "src/components/system/pmo/PmoTaskBoardStaging.jsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update calculatePriorityScore
content = content.replace(
    """    // 1. 준공필수 (30) / PF필수 (25) -> importance_level
    const importance = task.importance_level || fallbackItem?.importance_level || '중간';
    if (importance === '준공필수') {
        score += 30;
    } else if (importance === 'PF필수') {
        score += 25;
    }
    
    // 2. Blocker (20) -> is_blocker
    const isBlocker = parseBool(task.is_blocker !== undefined ? task.is_blocker : fallbackItem?.is_blocker);
    if (isBlocker) {
        score += 20;
    }
    
    // 3. 의사결정 (15) -> needs_decision
    const needsDecision = parseBool(task.needs_decision !== undefined ? task.needs_decision : fallbackItem?.needs_decision);
    if (needsDecision) {
        score += 15;
    }""",
    """    // 1. 준공필수 (35) / PF필수 (30) -> importance_level
    const importance = task.importance_level || fallbackItem?.importance_level || '중간';
    if (importance === '준공필수') {
        score += 35;
    } else if (importance === 'PF필수') {
        score += 30;
    }
    
    // 2. Blocker (25) -> is_blocker
    const isBlocker = parseBool(task.is_blocker !== undefined ? task.is_blocker : fallbackItem?.is_blocker);
    if (isBlocker) {
        score += 25;
    }
    
    // 3. 의사결정 (20) -> needs_decision
    const needsDecision = parseBool(task.needs_decision !== undefined ? task.needs_decision : fallbackItem?.needs_decision);
    if (needsDecision) {
        score += 20;
    }"""
)

# 2. Move ? badge down by 4px (-top-[2px] -> top-[2px])
target_badge = 'className="absolute -top-[2px] left-1/2 -translate-x-1/2 inline-flex items-center justify-center w-[13px] h-[13px] rounded-full bg-[#272726] border border-[#3c3c3c] hover:bg-white/20 text-[10px] text-[#86868B] hover:text-white font-bold cursor-pointer z-10"'
replacement_badge = 'className="absolute top-[2px] left-1/2 -translate-x-1/2 inline-flex items-center justify-center w-[13px] h-[13px] rounded-full bg-[#272726] border border-[#3c3c3c] hover:bg-white/20 text-[10px] text-[#86868B] hover:text-white font-bold cursor-pointer z-10"'
content = content.replace(target_badge, replacement_badge)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Priority scores and badge position updated.")
