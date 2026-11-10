import React, { useEffect, useState } from 'react';
import { supabase } from '../../../utils/supabaseClient';
import { groupStakeholderCompanies } from '../../../utils/stakeholderCategories';

export default function StakeholderDirectory({ category, embedded = false }) {
    const [rows, setRows] = useState([]);
    const [query, setQuery] = useState('');
    const [expanded, setExpanded] = useState(null);
    const [limit, setLimit] = useState(30);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [reload, setReload] = useState(0);
    useEffect(() => {
        const controller = new AbortController();
        setLoading(true); setError(''); setRows([]);
        setQuery(''); setExpanded(null); setLimit(30);
        const load = async () => {
            try {
                const aliases = category === 'LP' ? ['LP', '투자자'] : category === 'SI(기업)' ? ['SI(기업)', 'SI'] : [category];
                const all = [];
                for (let offset = 0; ; offset += 500) {
                    const result = await supabase.from('iota_stakeholder_master')
                        .select('id, company_name, contact_name, role_category')
                        .in('role_category', aliases).order('company_name').order('id')
                        .range(offset, offset + 499).abortSignal(controller.signal);
                    if (result.error) throw result.error;
                    all.push(...(result.data || []));
                    if ((result.data || []).length < 500) break;
                }
                if (!controller.signal.aborted) setRows(all);
            } catch (failure) {
                if (!controller.signal.aborted) setError('이해관계자 정보를 불러오지 못했습니다. 다시 시도해주세요.');
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        };
        load();
        return () => controller.abort();
    }, [category, reload]);
    const companies = groupStakeholderCompanies(rows, category, query);
    return <section className={embedded ? 'mt-8' : 'w-full flex-1 max-w-[1112px] mx-auto pt-7 pb-24'} aria-label={`${category} 이해관계자`}>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            {embedded ? <h2 className="text-[23px] font-bold text-white">등록된 {category}</h2> : <h1 className="text-[32px] font-bold text-white">{category}</h1>}
            <input type="search" aria-label={`${category} 회사·담당자 검색`} placeholder="회사·담당자 검색" value={query} onChange={event => {setQuery(event.target.value); setLimit(30);}} className="w-full sm:w-[280px] rounded-xl border border-[#545451] bg-[#272726] px-4 py-2 text-[13px] text-white outline-none focus:border-[#82a9c4]" />
        </div>
        <p className="text-[14px] text-[#86868B] mb-6">{category === 'SI(기업)' ? '전략적 투자 기업과 담당자 정보' : `${category} 분류로 등록된 회사·기관과 담당자 정보`}</p>
        {loading ? <p role="status" className="py-8 text-[#A1A1AA]">DB 데이터 연동 중...</p> : error ? <div role="alert" className="py-8 text-[#d99898]">{error}<button type="button" onClick={() => setReload(value => value + 1)} className="ml-3 cursor-pointer underline">다시 시도</button></div> : <>
            <p className="text-[12px] text-[#86868B] mb-3">{companies.length}개 회사·기관</p>
            <div className="overflow-hidden rounded-xl border border-[#3c3c3c] divide-y divide-[#3c3c3c]">
                {companies.slice(0, limit).map(([name, contacts]) => <div key={name}>
                    <button type="button" aria-expanded={expanded === name} onClick={() => setExpanded(expanded === name ? null : name)} className="flex w-full items-center justify-between gap-3 bg-[#272727] px-5 py-4 text-left cursor-pointer transition-colors hover:bg-[#303030]">
                        <span className="text-[15px] font-semibold text-white">{name}</span>
                        <span className="shrink-0 text-[12px] text-[#A1A1AA]">{contacts.filter(row => row.contact_name).length}명 {expanded === name ? '−' : '+'}</span>
                    </button>
                    {expanded === name && <div className="flex flex-wrap gap-3 bg-[#222] px-5 py-4">
                        {contacts.some(row => row.contact_name) ? contacts.filter(row => row.contact_name).map(row => <span key={row.id} className="rounded-lg border border-[#444] px-3 py-2 text-[14px] text-[#ddd]">{row.contact_name}</span>) : <p className="text-[13px] text-[#86868B]">등록된 담당자가 없습니다.</p>}
                    </div>}
                </div>)}
                {!companies.length && <p className="p-6 text-[14px] text-[#86868B]">{query ? '검색 결과가 없습니다.' : `등록된 ${category} 이해관계자가 없습니다.`}</p>}
            </div>
            {limit < companies.length && <button type="button" onClick={() => setLimit(value => value + 30)} className="mt-4 w-full rounded-xl border border-[#444] py-3 text-[13px] text-[#ccc] cursor-pointer transition-colors hover:bg-[#333]">더 보기</button>}
        </>}
    </section>;
}
