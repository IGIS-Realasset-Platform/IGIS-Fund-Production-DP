const supabaseUrl = "https://qgrszltduzblpvpqvkqr.supabase.co";
const supabaseKey = "sb_publishable_4xfLdHDF2yMobyRQruJV4A_Q4Fn9m9S";

const headers = {
    "apikey": supabaseKey,
    "Authorization": `Bearer ${supabaseKey}`,
    "Content-Type": "application/json",
    "Prefer": "return=minimal"
};

const oldStack = [{"id":"9c7a9c99-ac57-4e6e-8f76-6e7f6feaf3d3","vehicle_name":"421","phase":"Current","tranche_type":"Equity","tranche_name":"A종 수익증권","institution_name":"이지스자산운용㈜","amount_krw_100m":190.00,"counterparty_id":"CP-0436","created_at":"2026-05-03T05:06:41.303788+00:00"}, 
 {"id":"08d12c66-fef2-4970-82c8-d42bb64d49c9","vehicle_name":"421","phase":"Current","tranche_type":"Equity","tranche_name":"A종 수익증권","institution_name":"한중건설㈜","amount_krw_100m":130.00,"counterparty_id":"CP-0543","created_at":"2026-05-03T05:06:41.303788+00:00"}, 
 {"id":"785ea07b-9ff9-44e4-abf4-3010aa0ec823","vehicle_name":"421","phase":"Current","tranche_type":"Equity","tranche_name":"A종 수익증권","institution_name":"에셀유한회사","amount_krw_100m":100.00,"counterparty_id":"CP-0564","created_at":"2026-05-03T05:06:41.303788+00:00"}, 
 {"id":"c5eb44ef-a31c-4934-9c78-230e8744cd43","vehicle_name":"421","phase":"Current","tranche_type":"Equity","tranche_name":"A종 수익증권","institution_name":"구봉산업㈜","amount_krw_100m":100.00,"counterparty_id":"CP-0129","created_at":"2026-05-03T05:06:41.303788+00:00"}, 
 {"id":"d07af0f2-881c-4d7b-9ec2-adaef9dc2efb","vehicle_name":"421","phase":"Current","tranche_type":"Equity","tranche_name":"A종 수익증권","institution_name":"㈜데피니트파트너스","amount_krw_100m":60.00,"counterparty_id":"CP-0565","created_at":"2026-05-03T05:06:41.303788+00:00"}, 
 {"id":"a04d5a11-3e92-4fc7-89cf-1ec79f0d0f57","vehicle_name":"421","phase":"Current","tranche_type":"Equity","tranche_name":"A종 수익증권","institution_name":"㈜게우트플래닝","amount_krw_100m":40.00,"counterparty_id":"CP-0566","created_at":"2026-05-03T05:06:41.303788+00:00"}, 
 {"id":"1cb5a6c0-f40e-4be3-8aea-780910bbf44e","vehicle_name":"421","phase":"Current","tranche_type":"Equity","tranche_name":"B종 수익증권","institution_name":"이지스자산운용㈜","amount_krw_100m":134.50,"counterparty_id":"CP-0436","created_at":"2026-05-03T05:06:41.303788+00:00"}, 
 {"id":"3042875f-0e76-4879-bc77-ea4464d3b9c9","vehicle_name":"421","phase":"Current","tranche_type":"Equity","tranche_name":"B종 수익증권","institution_name":"안다인베스트먼트파트너스","amount_krw_100m":95.00,"counterparty_id":"CP-0336","created_at":"2026-05-03T05:06:41.303788+00:00"}, 
 {"id":"8bbd57e4-0936-4a87-bcd2-ee9b4e423c2d","vehicle_name":"421","phase":"Current","tranche_type":"Equity","tranche_name":"B종 수익증권","institution_name":"에셀유한회사","amount_krw_100m":53.50,"counterparty_id":"CP-0567","created_at":"2026-05-03T05:06:41.303788+00:00"}, 
 {"id":"36665156-26f2-4069-a0fb-0bee3098831b","vehicle_name":"421","phase":"Current","tranche_type":"Equity","tranche_name":"B종 수익증권","institution_name":"구봉산업㈜","amount_krw_100m":50.00,"counterparty_id":"CP-0129","created_at":"2026-05-03T05:06:41.303788+00:00"}, 
 {"id":"d40f8b61-6cbc-4ff4-be5a-7928ce4056ef","vehicle_name":"421","phase":"Current","tranche_type":"Equity","tranche_name":"B종 수익증권","institution_name":"㈜에스제이더블유인터내셔널","amount_krw_100m":30.00,"counterparty_id":"CP-0568","created_at":"2026-05-03T05:06:41.303788+00:00"}, 
 {"id":"a4a2822c-5d42-4cbb-ad9a-e0c42c3161ce","vehicle_name":"421","phase":"Current","tranche_type":"Equity","tranche_name":"B종 수익증권","institution_name":"㈜케이티에스테이트","amount_krw_100m":210.00,"counterparty_id":"CP-0492","created_at":"2026-05-03T05:06:41.303788+00:00"}, 
 {"id":"426a6a2b-ce01-4855-991e-c65f6eb0d56f","vehicle_name":"421","phase":"Current","tranche_type":"Equity","tranche_name":"B종 수익증권","institution_name":"주식회사안다자산운용","amount_krw_100m":15.00,"counterparty_id":"CP-0337","created_at":"2026-05-03T05:06:41.303788+00:00"}, 
 {"id":"927b9848-030e-4a34-9b61-ff7c1b4dbb9f","vehicle_name":"421","phase":"Current","tranche_type":"Equity","tranche_name":"B종 수익증권","institution_name":"이노베스트 코리아","amount_krw_100m":12.00,"counterparty_id":"CP-0396","created_at":"2026-05-03T05:06:41.303788+00:00"}, 
 {"id":"a8b68775-ce76-4c28-8a4f-f4af7ec0db71","vehicle_name":"421","phase":"Current","tranche_type":"Equity","tranche_name":"B종 수익증권","institution_name":"㈜데피니트파트너스","amount_krw_100m":10.00,"counterparty_id":"CP-0565","created_at":"2026-05-03T05:06:41.303788+00:00"}, 
 {"id":"aefe9324-f009-4762-85f1-85dd35b93502","vehicle_name":"421","phase":"Current","tranche_type":"Equity","tranche_name":"B종 수익증권","institution_name":"㈜디와이시스템","amount_krw_100m":10.00,"counterparty_id":"CP-0177","created_at":"2026-05-03T05:06:41.303788+00:00"}, 
 {"id":"a21d8e53-f15a-451a-9beb-1e60e03efa2b","vehicle_name":"421","phase":"Current","tranche_type":"Equity","tranche_name":"C종 수익증권","institution_name":"이지스자산운용㈜","amount_krw_100m":100.00,"counterparty_id":"CP-0436","created_at":"2026-05-03T05:06:41.303788+00:00"}, 
 {"id":"5ab84647-a4f6-4372-8662-097d0505c89f","vehicle_name":"421","phase":"Current","tranche_type":"Equity","tranche_name":"C종 수익증권","institution_name":"삼성물산","amount_krw_100m":800.00,"counterparty_id":"CP-0223","created_at":"2026-05-03T05:06:41.303788+00:00"}, 
 {"id":"f851cae2-bb40-4e74-8ecc-44638b38311e","vehicle_name":"421","phase":"Current","tranche_type":"Equity","tranche_name":"C종 수익증권","institution_name":"디에스클러스터 주식회사","amount_krw_100m":250.00,"counterparty_id":"CP-0174","created_at":"2026-05-03T05:06:41.303788+00:00"}, 
 {"id":"0df0c656-9fff-4942-956d-26a18bd08c27","vehicle_name":"421","phase":"Current","tranche_type":"Equity","tranche_name":"C종 수익증권","institution_name":"NH투자증권","amount_krw_100m":500.00,"counterparty_id":"CP-0569","created_at":"2026-05-03T05:06:41.303788+00:00"}, 
 {"id":"22da45b3-fcfe-4e3b-8593-4106439fbc24","vehicle_name":"421","phase":"Current","tranche_type":"Equity","tranche_name":"C종 수익증권","institution_name":"현대캐피탈","amount_krw_100m":200.00,"counterparty_id":"CP-0554","created_at":"2026-05-03T05:06:41.303788+00:00"}];

async function update() {
    // 1. Delete all 421 records
    const deleteRes = await fetch(`${supabaseUrl}/rest/v1/iota_capital_stack?vehicle_name=eq.421`, {
        method: "DELETE",
        headers
    });
    console.log("Delete status:", deleteRes.status);
    
    // 2. Insert old records
    const insertRes = await fetch(`${supabaseUrl}/rest/v1/iota_capital_stack`, {
        method: "POST",
        headers,
        body: JSON.stringify(oldStack)
    });
    console.log("Insert status:", insertRes.status);
}

update();
