import fs from 'fs';

const file = 'src/components/system/VehicleIntegrated.jsx';
let content = fs.readFileSync(file, 'utf8');

const targetStr = "setIotaData(grouped);";
const replacement = `
                    // --- 816 PFV Refinancing Mock Data Override ---
                    // DB 작업 전 프론트엔드 임시 하드코딩
                    grouped[816]['Refinancing'] = {
                        'Equity': [
                            { isSubHeader: true, name: '1종 종류주' },
                            { displayIndex: 1, name: '에셀유한회사', amount: '16.5', rawAmount: 16.5, type: 'Equity', originalTranche: '1종 종류주' },
                            { displayIndex: 2, name: 'NH투자증권', amount: '7.95', rawAmount: 7.95, type: 'Equity', originalTranche: '1종 종류주' },
                            { displayIndex: 3, name: '삼성물산', amount: '6', rawAmount: 6, type: 'Equity', originalTranche: '1종 종류주' },
                            { displayIndex: 4, name: '이지스자산운용(고유)', amount: '1', rawAmount: 1, type: 'Equity', originalTranche: '1종 종류주' },
                            { isSubHeader: true, name: '보통주' },
                            { displayIndex: 5, name: '이지스421호', amount: '19.55', rawAmount: 19.55, type: 'Equity', originalTranche: '보통주' },
                            { displayIndex: 6, name: '신한투자증권', amount: '12.95', rawAmount: 12.95, type: 'Equity', originalTranche: '보통주' },
                            { isSubHeader: true, name: '주주대여금' },
                            { displayIndex: 7, name: '이지스421호', amount: '2,535', rawAmount: 2535, type: 'Equity', originalTranche: '주주대여금' }
                        ],
                        'Tr.A-1': [
                            { displayIndex: 1, name: '메리츠증권(유동화포함)', amount: '1,800', rawAmount: 1800, type: 'Loan', originalTranche: 'Tr.A-1' },
                            { displayIndex: 2, name: '메리츠화재해상보험', amount: '1,800', rawAmount: 1800, type: 'Loan', originalTranche: 'Tr.A-1' },
                            { isSubHeader: true, name: 'Tr.A-2' },
                            { displayIndex: 3, name: 'NH투자증권(유동화포함)', amount: '1,300', rawAmount: 1300, type: 'Loan', originalTranche: 'Tr.A-2' }
                        ],
                        'Tr.B': [
                            { displayIndex: 1, name: '한투리얼(한국투자Debt)', amount: '600', rawAmount: 600, type: 'Loan', originalTranche: 'Tr.B' },
                            { displayIndex: 2, name: '한투리얼(한국투자메자닌)', amount: '350', rawAmount: 350, type: 'Loan', originalTranche: 'Tr.B' },
                            { displayIndex: 3, name: 'BC카드', amount: '150', rawAmount: 150, type: 'Loan', originalTranche: 'Tr.B' },
                            { displayIndex: 4, name: '스틱얼터너티브자산운용', amount: '100', rawAmount: 100, type: 'Loan', originalTranche: 'Tr.B' },
                            { displayIndex: 5, name: '대신저축은행', amount: '80', rawAmount: 80, type: 'Loan', originalTranche: 'Tr.B' },
                            { displayIndex: 6, name: '816공간제일차(신한증권)', amount: '50', rawAmount: 50, type: 'Loan', originalTranche: 'Tr.B' },
                            { displayIndex: 7, name: '실버아이언제일차(한화저축)', amount: '50', rawAmount: 50, type: 'Loan', originalTranche: 'Tr.B' },
                            { displayIndex: 8, name: '흥국저축은행', amount: '20', rawAmount: 20, type: 'Loan', originalTranche: 'Tr.B' }
                        ],
                        'Tr.C': [
                            { displayIndex: 1, name: '대신증권(디에스센터)', amount: '480', rawAmount: 480, type: 'Loan', originalTranche: 'Tr.C' },
                            { displayIndex: 2, name: '코람코국내개발일반사모', amount: '200', rawAmount: 200, type: 'Loan', originalTranche: 'Tr.C' },
                            { displayIndex: 3, name: '816공간제일차(신한증권)', amount: '150', rawAmount: 150, type: 'Loan', originalTranche: 'Tr.C' },
                            { displayIndex: 4, name: '키움가치추구형일반사모', amount: '90', rawAmount: 90, type: 'Loan', originalTranche: 'Tr.C' },
                            { displayIndex: 5, name: '816공간제일차(신한증권)', amount: '50', rawAmount: 50, type: 'Loan', originalTranche: 'Tr.C' }
                        ],
                        'Tr.D': [
                            { displayIndex: 1, name: '소노인터내셔널(유동화포함)', amount: '700', rawAmount: 700, type: 'Loan', originalTranche: 'Tr.D' }
                        ]
                    };
                    // ----------------------------------------------------
                    setIotaData(grouped);
`;

content = content.replace(targetStr, replacement);
fs.writeFileSync(file, content);
