import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';

export default function RightAIWidget({ mockData }) {
    const { lang } = useLanguage();
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState("");

    // Simulate RAG initializing
    useEffect(() => {
        const timer1 = setTimeout(() => {
            setMessages([{ 
                id: 1, 
                type: 'ai', 
                text: lang === 'kr' 
                    ? `[시스템] ${mockData.staticProfile.assetName} 자산의 모든 컨텍스트와 재무 지표를 로드했습니다. 무엇을 분석할까요?` 
                    : `[System] Loaded all context and financial metrics for ${mockData.staticProfile.assetName}. What would you like to analyze?`
            }]);
        }, 1000);

        return () => clearTimeout(timer1);
    }, [lang, mockData.staticProfile.assetName]);

    const handleSend = (e) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        const newMsg = { id: Date.now(), type: 'user', text: inputValue };
        setMessages(prev => [...prev, newMsg]);
        setInputValue("");

        // Mock AI response focusing on the red flag
        setTimeout(() => {
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                type: 'ai',
                text: lang === 'kr'
                    ? `분석 결과, 현재 가장 큰 리스크는 **${mockData.contextualData.redFlags.issue}** 입니다. 투심위 기록([23-11])에 따르면 선순위 비중 축소가 원인이었으며, 대응책으로 ${mockData.contextualData.redFlags.mitigation}을 실행 중입니다.`
                    : `Analysis shows the primary risk is **${mockData.contextualData.redFlags.issue}**. Based on board records ([23-11]), this stems from senior tranche reduction. As a countermeasure, we are ${mockData.contextualData.redFlags.mitigation}.`
            }]);
        }, 1200);
    };

    return (
        <div className="w-[300px] xl:w-[380px] h-full bg-[#f9f9fa] border-l border-gray-200 flex flex-col flex-shrink-0">
            {/* Header */}
            <div className="h-[70px] border-b border-gray-200 flex items-center px-5 flex-shrink-0 bg-white">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                    <h3 className="text-[14px] font-semibold tracking-tight text-gray-800">
                        IFPDP Context Engine
                    </h3>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-5 pb-8 flex flex-col gap-5">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex flex-col ${msg.type === 'user' ? 'items-end' : 'items-start'}`}>
                        {msg.type === 'ai' && (
                            <span className="text-[11px] text-gray-400 font-medium mb-1 ml-1">AI Agent</span>
                        )}
                        <div className={`
                            max-w-[85%] p-3.5 rounded-2xl text-[13px] leading-[1.6] font-medium tracking-tight
                            ${msg.type === 'user' 
                                ? 'bg-black text-white rounded-tr-sm' 
                                : 'bg-white border border-gray-200 text-gray-700 rounded-tl-sm shadow-sm'
                            }
                        `}>
                            {msg.text}
                        </div>
                    </div>
                ))}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-200 flex-shrink-0">
                <form onSubmit={handleSend} className="relative flex items-center">
                    <input 
                        type="text" 
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder={lang === 'kr' ? "자산 리스크나 기획안을 질문하세요..." : "Ask about asset risks or plans..."}
                        className="w-full h-[44px] bg-gray-100 hover:bg-gray-200 focus:bg-white focus:ring-1 focus:ring-black focus:outline-none rounded-xl text-[13px] pl-4 pr-12 transition-all"
                    />
                    <button 
                        type="submit"
                        disabled={!inputValue.trim()}
                        className="absolute right-2 w-8 h-8 flex items-center justify-center rounded-lg bg-black text-white disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14M12 5l7 7-7 7" /></svg>
                    </button>
                </form>
                <div className="mt-3 flex justify-center">
                    <span className="text-[10px] text-gray-400 font-medium tracking-tight">SSOT RAG Model - Access Level: Director</span>
                </div>
            </div>
        </div>
    );
}
