import os
import re

# 1. Update VehicleIntegrated.jsx sorting and grouping
with open('src/components/system/VehicleIntegrated.jsx', 'r') as f:
    vi_content = f.read()

# Replace the sorting logic for Equity
old_equity_grouping = """                        if ((v === 427 || v === 816) && (tranche === '1종 종류주 등' || tranche === '보통주' || tranche === '주주대여금' || tranche.includes('종류주'))) {
                            tranche = 'Equity';
                            type = 'Equity';
                            if (originalTranche === '주주대여금') {
                                sortOrder = 1;
                            }
                        }"""

new_equity_grouping = """                        if ((v === 427 || v === 816) && (tranche === '1종 종류주 등' || tranche === '보통주' || tranche === '주주대여금' || tranche.includes('종류주'))) {
                            tranche = 'Equity';
                            type = 'Equity';
                            if (originalTranche === '1종 종류주 등' || originalTranche.includes('종류주')) sortOrder = 0;
                            else if (originalTranche === '보통주') sortOrder = 1;
                            else if (originalTranche === '주주대여금') sortOrder = 2;
                        }"""
vi_content = vi_content.replace(old_equity_grouping, new_equity_grouping)

old_subheader_insert = """                                if ((v === 427 || v === 816) && t === 'Equity') {
                                    let hasSubheader = false;
                                    for (let i = 0; i < arr.length; i++) {
                                        if (arr[i].originalTranche === '주주대여금' && !hasSubheader) {
                                            arr.splice(i, 0, { isSubHeader: true, name: '주주대여금' });
                                            hasSubheader = true;
                                            i++; // skip the newly inserted subheader
                                        }
                                    }
                                }"""

new_subheader_insert = """                                if ((v === 427 || v === 816) && t === 'Equity') {
                                    const subheaders = ['1종 종류주 등', '보통주', '주주대여금'];
                                    subheaders.forEach(sub => {
                                        let hasSub = false;
                                        for (let i = 0; i < arr.length; i++) {
                                            if (!arr[i].isSubHeader && (arr[i].originalTranche === sub || (sub === '1종 종류주 등' && arr[i].originalTranche && arr[i].originalTranche.includes('종류주'))) && !hasSub) {
                                                arr.splice(i, 0, { isSubHeader: true, name: sub });
                                                hasSub = true;
                                                i++;
                                            }
                                        }
                                    });
                                }"""
vi_content = vi_content.replace(old_subheader_insert, new_subheader_insert)

with open('src/components/system/VehicleIntegrated.jsx', 'w') as f:
    f.write(vi_content)

# 2. Update IotaOne427DetailCard.jsx rendering logic
with open('src/components/system/shared/IotaOne427DetailCard.jsx', 'r') as f:
    card_content = f.read()

old_target_sub = """                                                        const isTargetSub = item.name === 'Tr.A-2' || item.name === 'Tr.B-2';
                                                        const subSum = isTargetSub ? items.filter(it => it.originalTranche === item.name).reduce((a,b) => a + (b.rawAmount || 0), 0) : 0;"""

new_target_sub = """                                                        const isTargetSub = item.name === 'Tr.A-2' || item.name === 'Tr.B-2' || item.name === '보통주' || item.name === '1종 종류주 등' || (item.name && item.name.includes('종류주'));
                                                        const subSum = isTargetSub ? items.filter(it => it.originalTranche === item.name || (item.name === '1종 종류주 등' && it.originalTranche && it.originalTranche.includes('종류주'))).reduce((a,b) => a + (b.rawAmount || 0), 0) : 0;"""

card_content = card_content.replace(old_target_sub, new_target_sub)

with open('src/components/system/shared/IotaOne427DetailCard.jsx', 'w') as f:
    f.write(card_content)
