import React from 'react';

export default function ReactionAvatarStack({ reactionEmails, pilotMembers }) {
    if (!reactionEmails || reactionEmails.length === 0) return null;
    
    const displayEmails = reactionEmails.slice(0, 3);
    const extraCount = reactionEmails.length - 3;
    
    return (
        <div className="flex items-center ml-[2px]">
            {displayEmails.map((email, idx) => {
                const member = pilotMembers.find(m => m.email === email);
                const name = member?.staff_name || email.split('@')[0];
                const role = member?.org_name || '팀원';
                
                return (
                    <div 
                        key={email} 
                        className={`relative w-[20px] h-[20px] rounded-full border-[1.5px] border-[#222] bg-[#333] group overflow-visible ${idx > 0 ? '-ml-[6px]' : ''}`}
                        style={{ zIndex: 10 - idx }}
                    >
                        <img 
                            src={`${import.meta.env.BASE_URL}${name}.webp`} 
                            alt={name} 
                            className="w-full h-full object-cover rounded-full"
                            onError={(e) => { e.target.src = `${import.meta.env.BASE_URL}default_avatar.svg`; }}
                        />
                        <div className="absolute bottom-[100%] left-1/2 -translate-x-1/2 mb-[6px] hidden group-hover:flex bg-[#222] border border-[#333] px-[8px] py-[4px] rounded-[6px] whitespace-nowrap text-[11px] text-[#E5E5E5] shadow-xl z-[99] pointer-events-none flex-col items-center leading-tight">
                            <span className="font-bold">{name}</span>
                            <span className="text-[#86868B] text-[10px]">{role}</span>
                        </div>
                    </div>
                );
            })}
            {extraCount > 0 && (
                <div className="w-[20px] h-[20px] rounded-full border-[1.5px] border-[#222] bg-[#333] flex items-center justify-center -ml-[6px] relative z-0">
                    <span className="text-[9px] text-[#A1A1AA] font-bold">+{extraCount}</span>
                </div>
            )}
        </div>
    );
}
