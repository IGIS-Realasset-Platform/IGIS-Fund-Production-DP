import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
    await supabase.from('iota_capital_stack').delete().eq('vehicle_name', '421').eq('phase', 'new');

    const data = [
        // A종
        { vehicle_name: '421', phase: 'new', tranche_type: 'Equity', tranche_name: 'A종 수익증권', institution_name: '이지스자산운용㈜', amount_krw_100m: 190, counterparty_id: 'CP-0436' },
        { vehicle_name: '421', phase: 'new', tranche_type: 'Equity', tranche_name: 'A종 수익증권', institution_name: '㈜포르테디앤씨', amount_krw_100m: 30, counterparty_id: 'CP-0436' },
        { vehicle_name: '421', phase: 'new', tranche_type: 'Equity', tranche_name: 'A종 수익증권', institution_name: '대신증권㈜', amount_krw_100m: 200, counterparty_id: 'CP-0436' },
        { vehicle_name: '421', phase: 'new', tranche_type: 'Equity', tranche_name: 'A종 수익증권', institution_name: '에셀유한회사', amount_krw_100m: 100, counterparty_id: 'CP-0436' },
        { vehicle_name: '421', phase: 'new', tranche_type: 'Equity', tranche_name: 'A종 수익증권', institution_name: '㈜데피니트파트너스', amount_krw_100m: 60, counterparty_id: 'CP-0436' },
        { vehicle_name: '421', phase: 'new', tranche_type: 'Equity', tranche_name: 'A종 수익증권', institution_name: '㈜게우트플래닝', amount_krw_100m: 40, counterparty_id: 'CP-0436' },
        // B종
        { vehicle_name: '421', phase: 'new', tranche_type: 'Equity', tranche_name: 'B종 수익증권', institution_name: '이지스자산운용㈜', amount_krw_100m: 134.5, counterparty_id: 'CP-0436' },
        { vehicle_name: '421', phase: 'new', tranche_type: 'Equity', tranche_name: 'B종 수익증권', institution_name: '안다인베스트먼트파트너스', amount_krw_100m: 95, counterparty_id: 'CP-0436' },
        { vehicle_name: '421', phase: 'new', tranche_type: 'Equity', tranche_name: 'B종 수익증권', institution_name: '에셀유한회사', amount_krw_100m: 53.5, counterparty_id: 'CP-0436' },
        { vehicle_name: '421', phase: 'new', tranche_type: 'Equity', tranche_name: 'B종 수익증권', institution_name: '구봉산업㈜', amount_krw_100m: 50, counterparty_id: 'CP-0436' },
        { vehicle_name: '421', phase: 'new', tranche_type: 'Equity', tranche_name: 'B종 수익증권', institution_name: '㈜에스제이더블유인터내셔널', amount_krw_100m: 30, counterparty_id: 'CP-0436' },
        { vehicle_name: '421', phase: 'new', tranche_type: 'Equity', tranche_name: 'B종 수익증권', institution_name: '㈜케이티에스테이트', amount_krw_100m: 210, counterparty_id: 'CP-0436' },
        { vehicle_name: '421', phase: 'new', tranche_type: 'Equity', tranche_name: 'B종 수익증권', institution_name: '주식회사안다자산운용', amount_krw_100m: 15, counterparty_id: 'CP-0436' },
        { vehicle_name: '421', phase: 'new', tranche_type: 'Equity', tranche_name: 'B종 수익증권', institution_name: '이노베스트 코리아', amount_krw_100m: 12, counterparty_id: 'CP-0436' },
        { vehicle_name: '421', phase: 'new', tranche_type: 'Equity', tranche_name: 'B종 수익증권', institution_name: '㈜데피니트파트너스', amount_krw_100m: 10, counterparty_id: 'CP-0436' },
        { vehicle_name: '421', phase: 'new', tranche_type: 'Equity', tranche_name: 'B종 수익증권', institution_name: '㈜디와이시스템', amount_krw_100m: 10, counterparty_id: 'CP-0436' },
        // C종
        { vehicle_name: '421', phase: 'new', tranche_type: 'Equity', tranche_name: 'C종 수익증권', institution_name: '이지스자산운용㈜', amount_krw_100m: 100, counterparty_id: 'CP-0436' },
        { vehicle_name: '421', phase: 'new', tranche_type: 'Equity', tranche_name: 'C종 수익증권', institution_name: '삼성물산', amount_krw_100m: 800, counterparty_id: 'CP-0436' },
        { vehicle_name: '421', phase: 'new', tranche_type: 'Equity', tranche_name: 'C종 수익증권', institution_name: '디에스클러스터 주식회사', amount_krw_100m: 250, counterparty_id: 'CP-0436' },
        { vehicle_name: '421', phase: 'new', tranche_type: 'Equity', tranche_name: 'C종 수익증권', institution_name: 'NH투자증권', amount_krw_100m: 375, counterparty_id: 'CP-0436' },
        { vehicle_name: '421', phase: 'new', tranche_type: 'Equity', tranche_name: 'C종 수익증권', institution_name: '주식회사 투어벨여행사', amount_krw_100m: 5, counterparty_id: 'CP-0436' },
        { vehicle_name: '421', phase: 'new', tranche_type: 'Equity', tranche_name: 'C종 수익증권', institution_name: '주식회사 경방', amount_krw_100m: 100, counterparty_id: 'CP-0436' },
        { vehicle_name: '421', phase: 'new', tranche_type: 'Equity', tranche_name: 'C종 수익증권', institution_name: '주식회사 안다자산운용', amount_krw_100m: 20, counterparty_id: 'CP-0436' },
        { vehicle_name: '421', phase: 'new', tranche_type: 'Equity', tranche_name: 'C종 수익증권', institution_name: '현대캐피탈', amount_krw_100m: 200, counterparty_id: 'CP-0436' },
        // C-1종
        { vehicle_name: '421', phase: 'new', tranche_type: 'Equity', tranche_name: 'C-1종 수익증권', institution_name: '이지스자산운용㈜', amount_krw_100m: 140, counterparty_id: 'CP-0436' }
    ];

    const { error } = await supabase.from('iota_capital_stack').insert(data);
    if (error) console.error('Error inserting 421 new data:', error);
    else console.log('Successfully inserted 421 detailed new data');
}
run();
