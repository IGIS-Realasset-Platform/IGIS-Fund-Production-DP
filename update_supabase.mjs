import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://qgrszltduzblpvpqvkqr.supabase.co';
const SUPABASE_KEY = 'sb_publishable_4xfLdHDF2yMobyRQruJV4A_Q4Fn9m9S';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const newRows = [
  // Equity
  { vehicle_name: '816', phase: 'Refinancing', tranche_type: 'Equity', tranche_name: '보통주', institution_name: '이지스421호', amount_krw_100m: 14.55 },
  { vehicle_name: '816', phase: 'Refinancing', tranche_type: 'Equity', tranche_name: '보통주', institution_name: '신한투자증권', amount_krw_100m: 0.45 },
  { vehicle_name: '816', phase: 'Refinancing', tranche_type: 'Equity', tranche_name: '1종 종류주', institution_name: '이지스자산운용(주)', amount_krw_100m: 1 },
  { vehicle_name: '816', phase: 'Refinancing', tranche_type: 'Equity', tranche_name: '1종 종류주', institution_name: '신한투자금융', amount_krw_100m: 7.5 },
  { vehicle_name: '816', phase: 'Refinancing', tranche_type: 'Equity', tranche_name: '1종 종류주', institution_name: '에셀', amount_krw_100m: 16.5 },
  { vehicle_name: '816', phase: 'Refinancing', tranche_type: 'Equity', tranche_name: '1종 종류주', institution_name: 'NH투자증권', amount_krw_100m: 7.95 },
  { vehicle_name: '816', phase: 'Refinancing', tranche_type: 'Equity', tranche_name: '1종 종류주', institution_name: '삼성물산', amount_krw_100m: 6 },
  { vehicle_name: '816', phase: 'Refinancing', tranche_type: 'Equity', tranche_name: '2종 종류주', institution_name: '이지스421호', amount_krw_100m: 5 },
  { vehicle_name: '816', phase: 'Refinancing', tranche_type: 'Equity', tranche_name: '2종 종류주', institution_name: '신한투자금융', amount_krw_100m: 5 },
  { vehicle_name: '816', phase: 'Refinancing', tranche_type: 'Equity', tranche_name: '주주대여금', institution_name: '이지스421호', amount_krw_100m: 2535 },

  // Loan
  { vehicle_name: '816', phase: 'Refinancing', tranche_type: 'Loan', tranche_name: 'Tr.A-1', institution_name: '케이에이치엘제이십일차(주) (메리츠증권 SPC)', amount_krw_100m: 1800 },
  { vehicle_name: '816', phase: 'Refinancing', tranche_type: 'Loan', tranche_name: 'Tr.A-1', institution_name: '메리츠화재', amount_krw_100m: 1800 },
  { vehicle_name: '816', phase: 'Refinancing', tranche_type: 'Loan', tranche_name: 'Tr.A-2', institution_name: '갤럭시이오(주) (NH투자증권 SPC)', amount_krw_100m: 1300 },
  { vehicle_name: '816', phase: 'Refinancing', tranche_type: 'Loan', tranche_name: 'Tr.B', institution_name: '816공간제일차(신한증권)', amount_krw_100m: 50 },
  { vehicle_name: '816', phase: 'Refinancing', tranche_type: 'Loan', tranche_name: 'Tr.B', institution_name: '한화실버아이언제일차(한화저축은행)', amount_krw_100m: 50 },
  { vehicle_name: '816', phase: 'Refinancing', tranche_type: 'Loan', tranche_name: 'Tr.B', institution_name: '한국투자Debt Strategy 일반사모부동산투자신탁1호 (한투리얼에셋운용)', amount_krw_100m: 600 },
  { vehicle_name: '816', phase: 'Refinancing', tranche_type: 'Loan', tranche_name: 'Tr.B', institution_name: '한국투자메자닌일반사모부동산투자신탁2호 (한투리얼에셋운용)', amount_krw_100m: 350 },
  { vehicle_name: '816', phase: 'Refinancing', tranche_type: 'Loan', tranche_name: 'Tr.B', institution_name: '스틱얼터너티브자산운용(주) (스틱크레딧안정화일반사모투자신탁제5호(전문))', amount_krw_100m: 100 },
  { vehicle_name: '816', phase: 'Refinancing', tranche_type: 'Loan', tranche_name: 'Tr.B', institution_name: '대신저축은행', amount_krw_100m: 80 },
  { vehicle_name: '816', phase: 'Refinancing', tranche_type: 'Loan', tranche_name: 'Tr.B', institution_name: '비씨카드', amount_krw_100m: 150 },
  { vehicle_name: '816', phase: 'Refinancing', tranche_type: 'Loan', tranche_name: 'Tr.B', institution_name: '흥국저축은행', amount_krw_100m: 20 },
  { vehicle_name: '816', phase: 'Refinancing', tranche_type: 'Loan', tranche_name: 'Tr.C', institution_name: '816공간제일차(신한증권)', amount_krw_100m: 200 },
  { vehicle_name: '816', phase: 'Refinancing', tranche_type: 'Loan', tranche_name: 'Tr.C', institution_name: '키움가치추구형일반사모부동산투자신탁제1호 (키움투자자산운용)', amount_krw_100m: 90 },
  { vehicle_name: '816', phase: 'Refinancing', tranche_type: 'Loan', tranche_name: 'Tr.C', institution_name: '이터널하이브(대신증권)', amount_krw_100m: 480 },
  { vehicle_name: '816', phase: 'Refinancing', tranche_type: 'Loan', tranche_name: 'Tr.C', institution_name: '코람코국내개발일반사모부동산투자신탁제1-2호 (코람코운용)', amount_krw_100m: 200 },
  { vehicle_name: '816', phase: 'Refinancing', tranche_type: 'Loan', tranche_name: 'Tr.D', institution_name: '케이에이치엘제이십이차(주) (소노인터내셔널 SPC)', amount_krw_100m: 700 }
];

async function updateDB() {
    console.log('1. Deleting existing 816 Refinancing data...');
    const { data: delData, error: delErr } = await supabase
        .from('iota_capital_stack')
        .delete()
        .eq('vehicle_name', '816')
        .eq('phase', 'Refinancing');
        
    if (delErr) {
        console.error('Delete Error:', delErr);
        return;
    }
    console.log('Deleted successfully.');

    console.log('2. Inserting updated data...');
    const { data: insData, error: insErr } = await supabase
        .from('iota_capital_stack')
        .insert(newRows);
        
    if (insErr) {
        console.error('Insert Error:', insErr);
        return;
    }
    console.log('Inserted successfully!');
}

updateDB();
