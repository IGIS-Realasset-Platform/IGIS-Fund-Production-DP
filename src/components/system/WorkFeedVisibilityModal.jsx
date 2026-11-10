import React, { useState } from 'react';
import { createPortal } from 'react-dom';
const X = ({size = 17}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m18 6-12 12M6 6l12 12" /></svg>;
const Check = ({size = 13}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m20 6-11 11-5-5" /></svg>;
const Search = ({size = 15, className}) => <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>;
function ModalShell({ title, description, onClose, width = 'max-w-[560px]', children, footer }) {
  if (typeof document === 'undefined') return null;
  return createPortal(
    <div className="fixed inset-0 z-[130000] flex items-center justify-center p-3 sm:p-5 [&_button]:cursor-pointer [&_button:disabled]:cursor-not-allowed [&_select]:cursor-pointer [&_select:disabled]:cursor-not-allowed">
      <button type="button" aria-label={`${title} 닫기`} className="absolute inset-0 bg-black/75 backdrop-blur-[2px]" onClick={onClose} />
      <section className={`relative flex max-h-[88dvh] w-full ${width} flex-col overflow-hidden rounded-[22px] border border-[#414141] bg-[#232323] shadow-2xl`}>
        <header className="flex items-start gap-4 border-b border-[#393939] px-4 py-4 sm:px-6 sm:py-5">
          <div className="min-w-0">
            <h3 className="text-[20px] font-black text-white">{title}</h3>
            {description && <p className="mt-1 text-[13px] leading-5 text-[#939398]">{description}</p>}
          </div>
          <button type="button" onClick={onClose} className="ml-auto grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[#454545] text-[#aaa] hover:text-white" aria-label="닫기">
            <X size={17} />
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">{children}</div>
        {footer && <footer className="border-t border-[#393939] px-4 py-4 sm:px-6">{footer}</footer>}
      </section>
    </div>,
    document.body,
  );
}

export default function WorkFeedVisibilityModal({ groups, members, selectedGroups, selectedIndividuals, onApply, onClose, requiredIndividuals = [], allowGroups = true }) {
  const [draftGroups, setDraftGroups] = useState(selectedGroups);
  const [draftIndividuals, setDraftIndividuals] = useState(() => [...new Set([...requiredIndividuals, ...selectedIndividuals])]);
  const [query, setQuery] = useState('');
  const orderedMembers = requiredIndividuals.length ? [...members].sort((left, right) => {
    const leftIndex = requiredIndividuals.indexOf(left.id);
    const rightIndex = requiredIndividuals.indexOf(right.id);
    return (leftIndex < 0 ? requiredIndividuals.length : leftIndex) - (rightIndex < 0 ? requiredIndividuals.length : rightIndex);
  }) : members;
  const filteredMembers = orderedMembers.filter((member) => (
    !query || `${member.name} ${member.group} ${member.email}`.toLowerCase().includes(query.toLowerCase())
  ));

  const toggle = (list, value) => (list.includes(value) ? list.filter((item) => item !== value) : [...list, value]);
  const publicPost = allowGroups && requiredIndividuals.length === 0 && draftGroups.length === 0 && draftIndividuals.length === 0;

  return (
    <ModalShell
      title="열람 권한 설정"
      description={allowGroups ? "이 게시물을 볼 수 있는 그룹과 특정 인원을 지정합니다." : "이 게시물을 볼 수 있는 인원을 선택하거나 제외합니다."}
      onClose={onClose}
      footer={(
        <div className="flex flex-wrap items-center gap-3">
          <p className={`mr-auto w-full text-[12px] font-bold sm:w-auto sm:flex-1 ${publicPost ? 'text-[#e2aa29]' : 'text-[#79b7e8]'}`}>
            {publicPost ? '설정하지 않으면 전체 공개로 게시됩니다.' : allowGroups ? '선택한 그룹과 인원만 열람합니다.' : draftIndividuals.length ? '선택한 인원만 열람합니다.' : '추가 열람 인원이 없습니다.'}
          </p>
          <button type="button" onClick={onClose} className="h-11 flex-1 whitespace-nowrap rounded-[9px] border border-[#484848] px-4 text-[13px] font-bold text-[#bbb] sm:h-10 sm:flex-none">취소</button>
          <button type="button" onClick={() => onApply(draftGroups, draftIndividuals)} className="h-11 flex-1 whitespace-nowrap rounded-[9px] bg-[#2b8de4] px-5 text-[13px] font-black text-white sm:h-10 sm:flex-none">확인</button>
        </div>
      )}
    >
      {allowGroups && <div>
        <h4 className="mb-3 text-[14px] font-black text-[#d5d5d7]">1. 그룹 선택 (다중 선택 가능)</h4>
        <div className="flex flex-wrap gap-2">
          {groups.map((group) => {
            const selected = draftGroups.includes(group);
            return (
              <button
                key={group}
                type="button"
                onClick={() => setDraftGroups((current) => toggle(current, group))}
                className={`rounded-[9px] border px-3 py-2 text-[12px] font-bold ${selected ? 'border-[#418dcc] bg-[#2b8de4]/20 text-[#9fd2ff]' : 'border-[#444] bg-[#1c1c1c] text-[#999]'}`}
              >
                {group}
              </button>
            );
          })}
          {groups.length === 0 && <p className="text-[13px] text-[#777]">등록된 그룹이 없습니다.</p>}
        </div>
      </div>}
      <div className={allowGroups ? "mt-7" : ""}>
        <h4 className="mb-3 text-[14px] font-black text-[#d5d5d7]">{allowGroups ? "2. 특정 인원 추가" : "열람 인원 선택"}</h4>
        <div aria-live="polite" className="mb-3">
          <p className="text-[12px] font-bold text-[#79b7e8]">추가된 인원 {draftIndividuals.length}명</p>
          {draftIndividuals.length > 0 && <div className="mt-2 flex flex-wrap gap-2">
            {draftIndividuals.map((id) => {
              const member = members.find((item) => item.id === id);
              const required = requiredIndividuals.includes(id);
              return (
                <span key={id} className="inline-flex items-center gap-2 rounded-[9px] border border-[#418dcc] bg-[#2b8de4]/20 px-2.5 py-1.5 text-[12px] text-[#9fd2ff]">
                  {member?.name || id}
                  {required ? <span className="text-[11px] text-[#85858b]">기본</span> : <button type="button" aria-label={`${member?.name || id} 열람 인원에서 제외`} onClick={() => setDraftIndividuals((current) => current.filter((value) => value !== id))} className="rounded text-[#9fd2ff] transition-colors hover:text-white"><X size={13} /></button>}
                </span>
              );
            })}
          </div>}
        </div>
        <label className="relative block">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#777]" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="이름·소속 검색" className="h-10 w-full rounded-[9px] border border-[#444] bg-[#1b1b1b] pl-9 pr-3 text-[16px] sm:text-[13px] text-white outline-none focus:border-[#4c8bbd]" />
        </label>
        <div className="mt-2 max-h-[220px] overflow-y-auto rounded-[10px] border border-[#3d3d3d]">
          {filteredMembers.map((member) => {
            const selected = draftIndividuals.includes(member.id);
            return (
              <button
                key={member.id}
                type="button"
                disabled={requiredIndividuals.includes(member.id)}
                aria-pressed={selected}
                onClick={() => setDraftIndividuals((current) => toggle(current, member.id))}
                className={`flex w-full items-center gap-3 border-b border-[#343434] px-3 py-2.5 text-left transition-colors last:border-0 hover:bg-white/[0.04] ${selected ? 'bg-[#2b8de4]/10' : ''}`}
              >
                <span className={`grid h-5 w-5 place-items-center rounded-[5px] border ${selected ? 'border-[#4b9bd9] bg-[#4b9bd9] text-white' : 'border-[#555] text-transparent'}`}><Check size={13} /></span>
                <span className="text-[13px] font-bold text-[#ddd]">{member.name}{requiredIndividuals.includes(member.id) && <span className="ml-2 text-[11px] font-normal text-[#85858b]">기본</span>}</span>
                {selected && <span className="shrink-0 text-[11px] font-bold text-[#79b7e8]">추가됨</span>}
                <span className="ml-auto text-[12px] text-[#85858b]">{member.group || member.email}</span>
              </button>
            );
          })}
        </div>
      </div>
    </ModalShell>
  );
}
