const myUrl = "https://qgrszltduzblpvpqvkqr.supabase.co/rest/v1";
const myKey = "sb_publishable_Gga5k7gjfXye0OaEXWpefw_RsCNWEmw";

const groups = [
    { name: '이철승', org: 'CFT 총괄' }, { name: '윤관식', org: 'CFT 총괄' }, { name: '정조민', org: 'CFT 총괄' }, { name: '우형석', org: 'CFT 총괄' },
    { name: '권순일', org: '사업PM' }, { name: '강순용', org: '사업PM' }, { name: '윤주형', org: '사업PM' }, { name: '김제익', org: '사업PM' },
    { name: '류홍', org: '사업PM' }, { name: '박만진', org: '사업PM' }, { name: '박일훈', org: '사업PM' }, { name: '이정원', org: '사업PM' },
    { name: '전무경', org: '사업PM' }, { name: '한찬호', org: '사업PM' }, { name: '박석제', org: '사업PM' }, { name: '박채현', org: '사업PM' },
    { name: '소현준', org: '사업PM' }, { name: '이수정', org: '사업PM' }, { name: '조영비', org: '사업PM' }, { name: '한수정', org: '사업PM' },
    { name: '박준호', org: '파이낸싱' }, { name: '강석민', org: '파이낸싱' }, { name: '정리훈', org: '파이낸싱' }, { name: '손유정', org: '파이낸싱' },
    { name: '김지우', org: '파이낸싱' }, { name: '박현승', org: '파이낸싱' }, { name: '이성민A', org: '파이낸싱' }, { name: '한승환', org: '파이낸싱' },
    { name: '홍장군', org: '개발관리' }, { name: '채원', org: '개발관리' }, { name: '김보성', org: '개발관리' }, { name: '전승희', org: '개발관리' },
    { name: '김대익', org: '개발관리' }, { name: '장성진', org: '개발관리' }, { name: '이정훈', org: '개발관리' }, { name: '박봉서', org: '개발관리' },
    { name: '김민지', org: '기업마케팅' }, { name: '고아라', org: '기업마케팅' }, { name: '이가현', org: '기업마케팅' }, { name: '정수명', org: '기업마케팅' },
    { name: '김현수', org: '상품·디지털' }, { name: '현철호', org: '상품·디지털' }, { name: '신민호', org: '상품·디지털' },
    { name: '김행단', org: '펀드운용' },
    { name: '윤용택', org: 'IPR' },
    { name: '이시정', org: '기획추진' }, { name: '이관용', org: '기획추진' }, { name: '전기영', org: '기획추진' }
];

async function update() {
    for (const member of groups) {
        const res = await fetch(`${myUrl}/iota_seoul_pilot_members?staff_name=eq.${member.name}`, {
            method: 'PATCH',
            headers: {
                apikey: myKey,
                Authorization: `Bearer ${myKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ org_name: member.org })
        });
        console.log(`Updated ${member.name}: ${res.status}`);
    }
}
update();
