const supabaseUrl = "https://qgrszltduzblpvpqvkqr.supabase.co";
const supabaseKey = "sb_publishable_4xfLdHDF2yMobyRQruJV4A_Q4Fn9m9S";

const headers = {
    "apikey": supabaseKey,
    "Authorization": `Bearer ${supabaseKey}`,
    "Content-Type": "application/json",
    "Prefer": "return=minimal"
};

const newStack = [
    // A종 수익증권
    { vehicle_name: "421", phase: "Current", tranche_type: "Equity", tranche_name: "A종 수익증권", institution_name: "이지스자산운용㈜", amount_krw_100m: 190.00 },
    { vehicle_name: "421", phase: "Current", tranche_type: "Equity", tranche_name: "A종 수익증권", institution_name: "㈜포르테디앤씨", amount_krw_100m: 30.00 },
    { vehicle_name: "421", phase: "Current", tranche_type: "Equity", tranche_name: "A종 수익증권", institution_name: "대신증권", amount_krw_100m: 200.00 },
    { vehicle_name: "421", phase: "Current", tranche_type: "Equity", tranche_name: "A종 수익증권", institution_name: "에셀유한회사", amount_krw_100m: 100.00 },
    { vehicle_name: "421", phase: "Current", tranche_type: "Equity", tranche_name: "A종 수익증권", institution_name: "㈜데피니트파트너스", amount_krw_100m: 60.00 },
    { vehicle_name: "421", phase: "Current", tranche_type: "Equity", tranche_name: "A종 수익증권", institution_name: "㈜게우트플래닝", amount_krw_100m: 40.00 },
    
    // B종 수익증권
    { vehicle_name: "421", phase: "Current", tranche_type: "Equity", tranche_name: "B종 수익증권", institution_name: "이지스자산운용㈜", amount_krw_100m: 134.50 },
    { vehicle_name: "421", phase: "Current", tranche_type: "Equity", tranche_name: "B종 수익증권", institution_name: "안다인베스트먼트파트너스", amount_krw_100m: 95.00 },
    { vehicle_name: "421", phase: "Current", tranche_type: "Equity", tranche_name: "B종 수익증권", institution_name: "에셀유한회사", amount_krw_100m: 53.50 },
    { vehicle_name: "421", phase: "Current", tranche_type: "Equity", tranche_name: "B종 수익증권", institution_name: "구봉산업㈜", amount_krw_100m: 50.00 },
    { vehicle_name: "421", phase: "Current", tranche_type: "Equity", tranche_name: "B종 수익증권", institution_name: "㈜에스제이더블유인터내셔널", amount_krw_100m: 30.00 },
    { vehicle_name: "421", phase: "Current", tranche_type: "Equity", tranche_name: "B종 수익증권", institution_name: "㈜케이티에스테이트", amount_krw_100m: 210.00 },
    { vehicle_name: "421", phase: "Current", tranche_type: "Equity", tranche_name: "B종 수익증권", institution_name: "주식회사안다자산운용", amount_krw_100m: 15.00 },
    { vehicle_name: "421", phase: "Current", tranche_type: "Equity", tranche_name: "B종 수익증권", institution_name: "이노베스트 코리아", amount_krw_100m: 12.00 },
    { vehicle_name: "421", phase: "Current", tranche_type: "Equity", tranche_name: "B종 수익증권", institution_name: "㈜데피니트파트너스", amount_krw_100m: 10.00 },
    { vehicle_name: "421", phase: "Current", tranche_type: "Equity", tranche_name: "B종 수익증권", institution_name: "㈜디와이시스템", amount_krw_100m: 10.00 },

    // C종 수익증권
    { vehicle_name: "421", phase: "Current", tranche_type: "Equity", tranche_name: "C종 수익증권", institution_name: "이지스자산운용㈜", amount_krw_100m: 100.00 },
    { vehicle_name: "421", phase: "Current", tranche_type: "Equity", tranche_name: "C종 수익증권", institution_name: "삼성물산", amount_krw_100m: 800.00 },
    { vehicle_name: "421", phase: "Current", tranche_type: "Equity", tranche_name: "C종 수익증권", institution_name: "디에스클러스터 주식회사", amount_krw_100m: 250.00 },
    { vehicle_name: "421", phase: "Current", tranche_type: "Equity", tranche_name: "C종 수익증권", institution_name: "NH투자증권", amount_krw_100m: 375.00 },
    { vehicle_name: "421", phase: "Current", tranche_type: "Equity", tranche_name: "C종 수익증권", institution_name: "주식회사 투어벨여행사", amount_krw_100m: 5.00 },
    { vehicle_name: "421", phase: "Current", tranche_type: "Equity", tranche_name: "C종 수익증권", institution_name: "주식회사 경방", amount_krw_100m: 100.00 },
    { vehicle_name: "421", phase: "Current", tranche_type: "Equity", tranche_name: "C종 수익증권", institution_name: "주식회사 안다자산운용", amount_krw_100m: 20.00 },
    { vehicle_name: "421", phase: "Current", tranche_type: "Equity", tranche_name: "C종 수익증권", institution_name: "현대캐피탈", amount_krw_100m: 200.00 },

    // C-1종 수익증권
    { vehicle_name: "421", phase: "Current", tranche_type: "Equity", tranche_name: "C-1종 수익증권", institution_name: "이지스자산운용㈜", amount_krw_100m: 140.00 }
];

async function update() {
    // 1. Delete all 421 records
    const deleteRes = await fetch(`${supabaseUrl}/rest/v1/iota_capital_stack?vehicle_name=eq.421`, {
        method: "DELETE",
        headers
    });
    console.log("Delete status:", deleteRes.status);
    
    // 2. Insert new records
    const insertRes = await fetch(`${supabaseUrl}/rest/v1/iota_capital_stack`, {
        method: "POST",
        headers,
        body: JSON.stringify(newStack)
    });
    console.log("Insert status:", insertRes.status);
}

update();
