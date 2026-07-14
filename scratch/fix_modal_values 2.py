import sys

file_path = "src/components/system/pmo/PmoTaskBoardStaging.jsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Revert calculatePriorityScore to the correct original logic
target_logic = """    // 1. 준공필수 (35) / PF필수 (30) -> importance_level
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

replacement_logic = """    // 1. 준공필수 (30) / PF필수 (25) -> importance_level
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
    }"""

content = content.replace(target_logic, replacement_logic)


# 2. Update the UI Modal HTML to match the logic
target_modal = """                                    <tr className="hover:bg-white/[0.02] h-10">
                                        <td className="px-4 py-2 font-bold text-white">준공필수</td>
                                        <td className="px-4 py-2 text-center font-mono text-[#bdbba7] font-bold">35</td>
                                        <td className="px-4 py-2 text-gray-400">준공/사용승인/담보대출과 직결</td>
                                        <td className="px-4 py-2 text-center text-gray-400">중요도</td>
                                    </tr>
                                    <tr className="hover:bg-white/[0.02] h-10">
                                        <td className="px-4 py-2 font-bold text-white">PF필수</td>
                                        <td className="px-4 py-2 text-center font-mono text-[#bdbba7] font-bold">30</td>
                                        <td className="px-4 py-2 text-gray-400">PF 실행 전 선결조건</td>
                                        <td className="px-4 py-2 text-center text-gray-400">중요도</td>
                                    </tr>
                                    <tr className="hover:bg-white/[0.02] h-10">
                                        <td className="px-4 py-2 font-bold text-white">Blocker</td>
                                        <td className="px-4 py-2 text-center font-mono text-[#bdbba7] font-bold">25</td>
                                        <td className="px-4 py-2 text-gray-400">막혀서 일정/판단 지연</td>
                                        <td className="px-4 py-2 text-center text-gray-400">Blocker</td>
                                    </tr>
                                    <tr className="hover:bg-white/[0.02] h-10">
                                        <td className="px-4 py-2 font-bold text-white">결정필요</td>
                                        <td className="px-4 py-2 text-center font-mono text-[#bdbba7] font-bold">20</td>"""

replacement_modal = """                                    <tr className="hover:bg-white/[0.02] h-10">
                                        <td className="px-4 py-2 font-bold text-white">준공필수</td>
                                        <td className="px-4 py-2 text-center font-mono text-[#bdbba7] font-bold">30</td>
                                        <td className="px-4 py-2 text-gray-400">준공/사용승인/담보대출과 직결</td>
                                        <td className="px-4 py-2 text-center text-gray-400">중요도</td>
                                    </tr>
                                    <tr className="hover:bg-white/[0.02] h-10">
                                        <td className="px-4 py-2 font-bold text-white">PF필수</td>
                                        <td className="px-4 py-2 text-center font-mono text-[#bdbba7] font-bold">25</td>
                                        <td className="px-4 py-2 text-gray-400">PF 실행 전 선결조건</td>
                                        <td className="px-4 py-2 text-center text-gray-400">중요도</td>
                                    </tr>
                                    <tr className="hover:bg-white/[0.02] h-10">
                                        <td className="px-4 py-2 font-bold text-white">Blocker</td>
                                        <td className="px-4 py-2 text-center font-mono text-[#bdbba7] font-bold">20</td>
                                        <td className="px-4 py-2 text-gray-400">막혀서 일정/판단 지연</td>
                                        <td className="px-4 py-2 text-center text-gray-400">Blocker</td>
                                    </tr>
                                    <tr className="hover:bg-white/[0.02] h-10">
                                        <td className="px-4 py-2 font-bold text-white">결정필요</td>
                                        <td className="px-4 py-2 text-center font-mono text-[#bdbba7] font-bold">15</td>"""

content = content.replace(target_modal, replacement_modal)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Reverted logic and updated UI modal.")
