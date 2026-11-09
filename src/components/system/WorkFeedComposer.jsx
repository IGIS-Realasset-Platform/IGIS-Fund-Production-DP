import { getProfileImageSrc } from '../../utils/profileImage';
import React, { useState } from 'react';
import { toggleFeedBold } from '../../utils/workFeedBold';

function Icon({ type, size = 15 }) {
    const paths = {
        chevron: <path d="m6 9 6 6 6-6" />,
        calendar: <><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></>,
        close: <path d="m18 6-12 12M6 6l12 12" />,
        clip: <path d="m21.4 11.1-9.2 9.2a6 6 0 0 1-8.5-8.5L13.6 2a4 4 0 0 1 5.7 5.7l-9.9 9.9a2 2 0 0 1-2.8-2.8l9.2-9.2" />,
        lock: <><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /><circle cx="12" cy="16" r="1" /></>,
        bold: <><path d="M6 12h8a4 4 0 0 1 0 8H6V4h7a4 4 0 0 1 0 8" /></>,
    };
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[type]}</svg>;
}

function SelectField({ label, value, onChange, options, mobileMode = false, color = 'text-[#e5e5e5]' }) {
    return <label className={`relative flex min-w-0 cursor-pointer gap-2 ${mobileMode ? "flex-col" : "items-center"}`}>
        <span className="shrink-0 text-[12px] font-bold text-[#85858b]">{label}</span>
        <select aria-label={label} value={value} onChange={event => onChange(event.target.value)} className={`${mobileMode ? "h-11 w-full text-[16px]" : "h-9 text-[13px]"} min-w-0 appearance-none rounded-[8px] border border-[#3e3e3e] bg-[#222] py-1 pl-3 pr-8 font-bold outline-none focus:border-[#4f89b7] ${color}`}>
            {options.map(option => <option key={option.value || option} value={option.value || option}>{option.label || option}</option>)}
        </select>
        <span className={`pointer-events-none absolute right-3 text-[#777] ${mobileMode ? "bottom-[14px]" : ""}`}><Icon type="chevron" size={13} /></span>
    </label>;
}

// Presentation only: uploads, permissions and mutations remain in LogWriteBox.
export default function WorkFeedComposer({ mobileMode = false, memberInfo, expanded, setExpanded, editMode, onCancel, fields, setters, textareaRef, formId, onContentChange, onRefreshDirectory, onRefreshContacts, onContactSelect, mentions, showMentions, onMentionSelect, onCloseMentions, companyOptions, contactOptions, permissions, files, onRemoveFile, fileInputRef, onFileUpload, onChooseFiles, uploading, onVisibility, onSubmit, submitting }) {
    const [contactsOpen, setContactsOpen] = useState(false);
    const [contactsLoading, setContactsLoading] = useState(false);
    const [activeContact, setActiveContact] = useState(-1);
    const selectContact = (name) => {
        onContactSelect(name);
        setContactsOpen(false);
        setActiveContact(-1);
    };
    const avatar = <img src={getProfileImageSrc(memberInfo?.staff_name)} alt={memberInfo?.staff_name || '사용자'} className="h-10 w-10 shrink-0 rounded-full border border-white/10 bg-[#333] object-cover" onError={event => { event.currentTarget.onerror = null; event.currentTarget.src = `${import.meta.env.BASE_URL}default_avatar.svg`; }} />;
    const applyBold = () => {
        const input = textareaRef.current;
        if (!input) return;
        const next = toggleFeedBold(fields.content, input.selectionStart, input.selectionEnd);
        setters.content(next.content);
        onCloseMentions();
        requestAnimationFrame(() => { input.focus(); input.setSelectionRange(next.start, next.end); });
    };
    const settingsFields = <>
            <SelectField mobileMode={mobileMode} label="프로젝트" value={fields.projectId} onChange={setters.projectId} options={[{value:'IOTA_COMMON',label:'IOTA 공통'},{value:'P00030',label:'427 PFV'},{value:'P00037',label:'816 PFV'},{value:'112614',label:'421 Fund'},{value:'EXTERNAL',label:'외부'}]} />
            <SelectField mobileMode={mobileMode} label="활용목적" value={fields.triageType} onChange={setters.triageType} options={['공유','협업','리스크 판단','의사결정']} />
            <SelectField mobileMode={mobileMode} label="진행상태" value={fields.issueStatus} onChange={setters.issueStatus} options={['신규','검토중','진행중','보류','완료']} />
            <SelectField mobileMode={mobileMode} label="중요도" value={fields.priority} onChange={setters.priority} options={['높음','중간','낮음']} color={fields.priority === '높음' ? 'text-[#de827e]' : fields.priority === '중간' ? 'text-[#7eb6e1]' : 'text-[#86b79c]'} />
    </>;
    if (mobileMode && !expanded && !editMode) return <div className="flex justify-end">
        <button type="button" onClick={() => setExpanded(true)} aria-expanded="false" className="inline-flex h-11 cursor-pointer items-center gap-1 rounded-[8px] px-2 text-[13px] font-semibold text-[#bcdbdb] transition-colors hover:bg-white/5"><span aria-hidden="true" className="text-[18px] font-normal">+</span> 글쓰기</button>
    </div>;
    if (!expanded && !editMode) return <button type="button" onClick={() => setExpanded(true)} className={`flex w-full items-center rounded-[23px] bg-[#262626] py-[13px] text-left hover:bg-[#2a2a2a] cursor-pointer ${mobileMode ? "gap-2 px-3" : "gap-4 px-[18px]"}`}>
        {avatar}<span className={`min-w-0 flex-1 font-bold text-[#bcdbdb] ${mobileMode ? "text-[13px]" : "text-[16px]"}`}>{mobileMode ? "업무 이슈를 공유하세요." : "업무 메시지, 협업 사항 또는 공유할 내용을 등록하세요."}</span>
        <span className={`shrink-0 rounded-[8px] border border-[#83adb5] bg-[#222] py-2 text-[13px] font-black text-[#e5e5e5] ${mobileMode ? "px-2" : "px-4"}`}>글작성하기</span>
    </button>;
    return <section className="w-full min-w-0 [&_button]:cursor-pointer [&_button:disabled]:cursor-not-allowed [&_select]:cursor-pointer">
        {mobileMode ? <header className="border-b border-[#383838]">
            {editMode ? <div className="flex min-w-0 items-center gap-3 px-3 py-3">
                {avatar}
                <div className="min-w-0 flex-1"><p className="truncate text-[14px] font-bold text-white">{memberInfo?.staff_name || '작성자'}</p><p className="text-[12px] text-[#999]">글 수정</p></div>
                <button type="button" onClick={onCancel} className="h-11 shrink-0 rounded-[9px] border border-[#454545] px-3 text-[13px] text-[#bbb] hover:bg-[#333]">닫기</button>
            </div> : <button type="button" aria-label="글쓰기 접기" aria-expanded="true" onClick={() => setExpanded(false)} className="flex w-full min-w-0 items-center gap-3 px-3 py-3 text-left hover:bg-[#303030] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#78add6]">
                {avatar}
                <span className="min-w-0 flex-1"><span className="block truncate text-[14px] font-bold text-white">{memberInfo?.staff_name || '작성자'}</span><span className="block text-[12px] text-[#999]">새 글 작성</span></span>
                <span className="flex h-11 shrink-0 items-center rounded-[9px] border border-[#454545] px-3 text-[13px] text-[#bbb]">접기</span>
            </button>}
        </header> : <header className="flex flex-wrap items-center gap-3 border-b border-[#383838] px-5 py-3">
            {avatar}
            {settingsFields}
            <div className="flex items-center gap-2">
                <span className="shrink-0 text-[12px] font-bold text-[#85858b]">업무 기한</span>
                <label className="relative inline-flex h-9 cursor-pointer items-center gap-2 rounded-[8px] border border-[#3e3e3e] bg-[#222] px-3 text-[12px] font-bold text-[#ddd]">
                    <Icon type="calendar" size={14} />{new Date(`${fields.workDate}T12:00:00`).toLocaleDateString('ko-KR', {year:'numeric', month:'long', day:'numeric', weekday:'short'})}
                    <input aria-label="업무 기한" type="date" value={fields.workDate} onChange={event => setters.workDate(event.target.value)} onClick={event => event.currentTarget.showPicker?.()} className="absolute inset-0 h-full w-full cursor-pointer opacity-0" />
                </label>
            </div>
            <div className="ml-auto">
            {editMode ? <button type="button" onClick={onCancel} aria-label="수정 닫기" className="grid h-9 w-9 place-items-center rounded-[8px] border border-[#454545] text-[#aaa] hover:bg-[#333]"><Icon type="close" size={16} /></button> : <button type="button" onClick={() => setExpanded(false)} className="rounded-[8px] border border-[#454545] px-3 py-2 text-[12px] font-bold text-[#bbb] hover:bg-[#333]">접기</button>}
            </div>
        </header>}

        <div className={mobileMode ? "min-w-0 px-3 py-4" : "px-5 pb-5 pt-5"}>
            <input aria-label="제목" value={fields.title} onChange={event => setters.title(event.target.value)} placeholder="제목을 입력하세요" className="w-full border-b border-[#3a3a3a] bg-transparent pb-3 text-[17px] font-black text-[#ededed] outline-none placeholder:text-[#777]" />
            <div className="relative mt-4">
                <div className="mb-2 flex items-center gap-2">
                    <button type="button" onMouseDown={event => event.preventDefault()} onClick={applyBold} aria-label="굵게 적용 또는 해제" aria-keyshortcuts="Control+b Meta+b" title="굵게 적용/해제 (⌘B / Ctrl+B)" className="grid h-8 w-8 shrink-0 place-items-center rounded-[6px] border border-[#454545] text-[#ddd] hover:bg-[#363636] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#78add6]"><Icon type="bold" size={16} /></button>
                    <span className="min-w-0 text-[12px] leading-5 text-[#999]">{mobileMode ? "텍스트 선택 후 B · @멘션 · URL 자동 링크" : "문장 선택 후 B · **강조할 내용**은 등록 시 굵게 표시 · URL은 자동으로 링크됩니다."}</span>
                </div>
                <textarea ref={textareaRef} id={`log-textarea-${formId}`} aria-label="본문" value={fields.content} onChange={onContentChange} onFocus={onRefreshDirectory} onKeyDown={event => { if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'b' && !event.nativeEvent.isComposing) { event.preventDefault(); applyBold(); } if (event.key === 'Escape') onCloseMentions(); }} placeholder={'진행 이력, 협업 요청, 리스크 판단 필요사항, 의사결정 필요항목을 입력하세요.\n(@로 담당부서 또는 담당자를 멘션할 수 있습니다)'} className={`w-full min-w-0 bg-transparent leading-7 text-[#e5e5e5] outline-none placeholder:text-[#8f8d87] ${mobileMode ? "min-h-[200px] resize-y text-[16px]" : "min-h-[150px] resize-y text-[15px]"}`} />
                {showMentions && mentions.length > 0 && <div className={`z-40 max-h-[240px] max-w-full overflow-y-auto rounded-[10px] border border-[#444] bg-[#202020] py-1.5 shadow-2xl ${mobileMode ? "relative mt-2 w-full" : "absolute left-0 top-[70px] w-[300px]"}`}>
                    {mentions.map(mention => <button key={`${mention.type}:${mention.label}`} type="button" onMouseDown={event => event.preventDefault()} onClick={() => onMentionSelect(mention)} className="flex w-full items-center gap-2 px-3 py-2.5 text-left hover:bg-[#333]"><span className={`shrink-0 rounded-[5px] px-2 py-1 text-[12px] font-black ${mention.type === 'department' ? 'bg-[#2c7eb6]/15 text-[#7fc5ee]' : 'bg-white/[0.07] text-[#bbb]'}`}>{mention.type === 'department' ? '부서' : '담당자'}</span><span className="truncate text-[13px] font-bold text-[#eee]">@{mention.label}</span><span className="ml-auto truncate text-[12px] text-[#777]">{mention.organization}</span></button>)}
                </div>}
            </div>
            {files.length > 0 && <div className="mt-4 flex flex-wrap gap-2 border-t border-[#363636] pt-4">{files.map((file, index) => <span key={file.path || index} className="flex min-w-0 max-w-full items-center gap-2 rounded-[8px] border border-[#444] bg-[#222] px-3 py-2 text-[12px] font-bold text-[#ccc]"><Icon type="clip" size={14} /><span className="min-w-0 max-w-[240px] truncate">{file.name}</span><button type="button" aria-label={`${file.name} 첨부 제거`} onClick={() => onRemoveFile(index)} className="text-[#888] hover:text-[#ff8179]"><Icon type="close" size={13} /></button></span>)}</div>}
            {permissions.length > 0 && <p className="mt-3 w-full whitespace-normal break-words text-right text-[12px] font-black leading-5 text-[#df7f7a]">열람권한: {permissions.join(', ')}</p>}
        </div>
        {mobileMode && <div className="grid min-w-0 grid-cols-2 gap-3 border-t border-[#383838] px-3 py-4">
            <h3 className="col-span-2 text-[13px] font-bold text-[#bbb]">게시글 설정</h3>
            {settingsFields}
            <label className="col-span-2 flex min-w-0 flex-col gap-2 text-[12px] font-bold text-[#85858b]">업무 기한
                <input aria-label="업무 기한" type="date" value={fields.workDate} onChange={event => setters.workDate(event.target.value)} className="box-border h-11 w-full min-w-0 max-w-full appearance-none rounded-[8px] border border-[#3e3e3e] bg-[#222] px-3 text-[16px] text-white outline-none" />
            </label>
        </div>}
        <footer className={mobileMode ? "grid min-w-0 grid-cols-2 gap-3 border-t border-[#383838] px-3 py-4" : "flex flex-wrap items-center gap-2 border-t border-[#383838] px-5 py-3"}>
            <span className={`${mobileMode ? "col-span-2" : "shrink-0"} text-[12px] font-black text-[#8f8f94]`}>이해관계자</span>
            <label className={mobileMode ? "relative col-span-2 min-w-0" : "relative min-w-[150px] flex-1"}><span className="sr-only">회사·기관명</span><input list={`${formId}-companies`} value={fields.companyQuery} onChange={event => { setters.companyQuery(event.target.value); setters.contactQuery(''); }} placeholder="회사·기관명" className={`${mobileMode ? "h-11 text-[16px]" : "h-10 text-[13px]"} w-full min-w-0 rounded-[9px] border border-[#414141] bg-[#222] px-3 text-white outline-none focus:border-[#4f89b7]`} /><datalist id={`${formId}-companies`}>{companyOptions.map(name => <option key={name} value={name} />)}</datalist></label>
            <div className={mobileMode ? "relative col-span-2 min-w-0" : "relative min-w-[130px] flex-1"} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setContactsOpen(false); }}>
                <input aria-label="담당자명" role="combobox" aria-autocomplete="list" aria-expanded={contactsOpen} aria-controls={`${formId}-contacts`} aria-activedescendant={contactsOpen && contactOptions[activeContact] ? `${formId}-contact-${activeContact}` : undefined} autoComplete="off" value={fields.contactQuery}
                    onChange={event => { setters.contactQuery(event.target.value); setContactsOpen(true); setActiveContact(-1); }}
                    onFocus={async () => { setContactsOpen(true); setActiveContact(-1); setContactsLoading(true); try { await onRefreshContacts?.(); } finally { setContactsLoading(false); } }}
                    onKeyDown={event => {
                        if (event.nativeEvent.isComposing) return;
                        if (event.key === 'Escape') setContactsOpen(false);
                        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                            event.preventDefault(); setContactsOpen(true);
                            setActiveContact(current => contactOptions.length ? (current + (event.key === 'ArrowDown' ? 1 : -1) + contactOptions.length) % contactOptions.length : -1);
                        }
                        if (event.key === 'Enter' && contactsOpen && contactOptions[activeContact]) { event.preventDefault(); selectContact(contactOptions[activeContact]); }
                    }}
                    placeholder="담당자명 검색/입력" className={`${mobileMode ? "h-11 text-[16px]" : "h-10 text-[13px]"} w-full min-w-0 rounded-[9px] border border-[#414141] bg-[#222] px-3 text-white outline-none focus:border-[#4f89b7]`} />
                {contactsOpen && <div id={`${formId}-contacts`} role="listbox" aria-label="담당자 검색 결과" className="absolute bottom-full left-0 z-50 mb-2 max-h-[180px] w-full overflow-y-auto rounded-[9px] border border-[#444] bg-[#222] py-1 shadow-xl">
                    {contactOptions.map((name, index) => <button key={name} id={`${formId}-contact-${index}`} type="button" role="option" aria-selected={fields.contactQuery === name} onMouseDown={event => event.preventDefault()} onClick={() => selectContact(name)} className={`block w-full px-3 py-2 text-left text-[13px] text-[#ddd] transition-colors hover:bg-[#333] ${activeContact === index ? 'bg-[#333]' : ''}`}>{name}</button>)}
                    {contactOptions.length === 0 && <p role="status" className="px-3 py-2 text-[12px] text-[#999]">{contactsLoading ? '담당자 불러오는 중…' : fields.contactQuery ? '일치하는 담당자가 없습니다. 직접 입력할 수 있습니다.' : fields.companyQuery ? '해당 회사에 등록된 담당자가 없습니다. 직접 입력할 수 있습니다.' : '등록된 담당자가 없습니다. 직접 입력할 수 있습니다.'}</p>}
                </div>}
            </div>
            <input type="file" ref={fileInputRef} onChange={onFileUpload} className="hidden" multiple />
            <button type="button" onClick={onChooseFiles} disabled={uploading} className={`${mobileMode ? "h-11 min-w-0 justify-center px-2" : "h-10 px-4"} flex items-center gap-2 rounded-[9px] border border-[#464646] text-[13px] font-black text-[#bbb] hover:bg-white/[0.04]`}><Icon type="clip" />{uploading ? '업로드 중...' : '파일 첨부'}</button>
            <button type="button" onClick={onVisibility} className={`${mobileMode ? "h-11 min-w-0 justify-center px-2" : "h-10 px-4"} flex items-center gap-2 rounded-[9px] border border-[#914743] text-[13px] font-black text-[#e17f79] hover:bg-[#ff453a]/5`}><Icon type="lock" />열람권한</button>
            {editMode && <button type="button" onClick={onCancel} className={`${mobileMode ? "col-span-2 h-11" : "h-10"} rounded-[9px] border border-[#494949] px-5 text-[13px] font-black text-[#bbb] hover:bg-[#333]`}>취소</button>}
            <button type="button" onClick={onSubmit} disabled={submitting || uploading} className={`${mobileMode ? "col-span-2 h-12 w-full text-[15px]" : "h-10 text-[13px]"} rounded-[9px] bg-[#2b8de4] px-7 font-black text-white hover:bg-[#3279b4] disabled:opacity-50`}>{submitting ? '저장 중...' : editMode ? '수정 완료' : '작성하기'}</button>
        </footer>
    </section>;
}
