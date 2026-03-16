import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function Footer({ className = "mt-[100px]", variant = "dark" }) {
    const { lang } = useLanguage();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const isLight = variant === "light";
    const bgColor = isLight ? "bg-white" : "bg-[#2a3134]";
    const textColor = isLight ? "text-[#777]" : "text-white/50";
    const brandColor = isLight ? "text-[#333]" : "text-white/70";
    const copyrightColor = isLight ? "text-[#999]" : "text-white/30";
    const disclaimerColor = isLight ? "text-[#999]" : "text-white/40";
    const modalBgColor = isLight ? "bg-white text-black" : "bg-[#2a3134] text-white";

    return (
        <div className={`w-full ${bgColor} pt-8 md:pt-12 pb-8 md:pb-12 flex flex-col items-center ${className}`}>
            <footer className={`w-full text-center ${textColor} text-[12px] md:text-[14px] font-inter font-light tracking-[-0.02em] px-4 leading-[1.6] flex flex-col gap-2`}>
                <span className={`block font-bold ${brandColor} tracking-[-0.02em] text-[13px] md:text-[15px]`}>IOTA SEOUL</span>

                <span className={`block text-[12px] md:text-[13px] ${disclaimerColor} break-keep flex items-center justify-center flex-wrap gap-2`}>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="underline hover:opacity-80 transition-opacity font-normal cursor-pointer"
                    >
                        {lang === 'kr' ? "면책공고" : "Disclaimer"}
                    </button>
                    <span className="opacity-50">|</span>
                    <span>
                        {lang === 'kr'
                            ? "본 디지털 비전북에 포함된 모든 이미지, 설계 제원 및 프로젝트 상세 계획은 이해를 돕기 위해 제작된 것으로 실제와 다를 수 있습니다."
                            : "All images, design specifications, and detailed project plans included in this digital vision book are intended for illustrative purposes only and may differ from the actual implementation."}
                    </span>
                </span>

                <span className="block">A strategic digital vision book platform developed by IGIS Asset Management.</span>

                <span className={`block ${copyrightColor} text-[11px] md:text-[13px]`}>© 2026 IOTA SEOUL & IGIS Asset Management. All rights reserved.</span>
            </footer>

            {/* Disclaimer Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className={`w-full max-w-2xl max-h-[80vh] overflow-y-auto rounded-xl p-6 md:p-8 ${modalBgColor} shadow-2xl relative text-left`}>
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-4 right-4 p-2 opacity-60 hover:opacity-100 transition-opacity"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        {lang === 'kr' ? (
                            <div className="font-sans text-[13px] md:text-[14px] leading-relaxed font-light break-keep">
                                <h3 className="text-[18px] md:text-[20px] font-bold mb-6 font-inter tracking-tight">[면책공고 / Disclaimer]</h3>
                                <p className="mb-6">
                                    본 <strong>디지털 비전북(iotaseoul.site)</strong>은 이지스자산운용 주식회사(이하 “회사”)가 프로젝트에 대한 이해를 돕기 위해 관련 정보와 공개된 자료를 근거로 제작한 것이며, 이용 시 다음과 같은 주의사항을 고지합니다.
                                </p>

                                <ol className="list-decimal pl-5 space-y-5">
                                    <li className="pl-1">
                                        <strong className="block font-bold mb-1">정보의 목적 및 성격</strong>
                                        본 디지털 비전북은 투자설명서, 상품설명서 또는 정식 IM(Information Memorandum) 자료가 아니며, 프로젝트에 대한 단순 참고용 정보 제공을 목적으로 합니다.<br />
                                        본 자료는 이용자의 투자 의사결정을 위한 근거 자료로 작성된 것이 아니며, 어떠한 경우에도 투자 권유나 자문의 용도로 이용될 수 없습니다.
                                    </li>
                                    <li className="pl-1">
                                        <strong className="block font-bold mb-1">정보의 정확성 및 완전성</strong>
                                        본 자료에 게재된 조감도, 설계 제원, 수치 및 상세 계획(IOTA Details)은 현재의 사업 계획을 바탕으로 작성된 예시이며, 실제 시공 시 인허가 조건 및 사업 환경의 변화에 따라 별도의 고지 없이 수시로 변경될 수 있습니다.<br />
                                        회사는 본 자료에 포함된 정보의 정확성, 완전성, 적절성에 대하여 명시적 또는 묵시적으로 어떠한 의견 표명이나 보증을 하지 않습니다.
                                    </li>
                                    <li className="pl-1">
                                        <strong className="block font-bold mb-1">이용자의 책임 및 전문적 조언</strong>
                                        이용자는 본 자료의 정보를 평가함에 있어 각자의 책임하에 전문적인 조언을 구하고 스스로의 판단에 의존해야 합니다.<br />
                                        본 자료에 포함되거나 추가로 제공된 정보를 활용하여 내린 결정에 대하여 회사와 그 임직원은 여하한 법률적 책임을 부담하지 않습니다.
                                    </li>
                                    <li className="pl-1">
                                        <strong className="block font-bold mb-1">사업 절차의 권리 및 취소</strong>
                                        회사는 프로젝트 진행 상황에 따라 사업의 절차, 구조, 일정 등을 언제든지 변경, 취소 또는 중단할 수 있는 권리를 가집니다.<br />
                                        이와 관련하여 회사는 잠재적 투자자나 이용자에게 어떠한 법적 의무를 부담하지 않으며, 이용자는 이에 대해 이의를 제기할 수 없습니다.
                                    </li>
                                    <li className="pl-1">
                                        <strong className="block font-bold mb-1">기타 법적 고지</strong>
                                        본 디지털 비전북 및 그에 포함된 정보는 회사의 내부 검토 과정을 거쳐 공식적으로 등록된 법적 문서가 아닙니다.<br />
                                        본 자료는 금융투자회사의 영업 및 업무에 관한 규정에 따른 투자광고에 해당하지 않습니다.
                                    </li>
                                </ol>
                            </div>
                        ) : (
                            <div className="font-sans text-[13px] md:text-[14px] leading-relaxed font-light break-keep">
                                <h3 className="text-[18px] md:text-[20px] font-bold mb-6 font-inter tracking-tight">[Disclaimer]</h3>
                                <p className="mb-6">
                                    This <strong>Digital Vision Book (iotaseoul.site)</strong> has been produced by IGIS Asset Management Co., Ltd. (hereinafter referred to as the "Company") based on relevant information and publicly available data to facilitate an understanding of the project. Please be advised of the following precautions when using this material:
                                </p>

                                <ol className="list-decimal pl-5 space-y-5">
                                    <li className="pl-1">
                                        <strong className="block font-bold mb-1">Purpose and Nature of Information</strong>
                                        This digital vision book is not a prospectus, product description, or formal Information Memorandum (IM), and its purpose is solely to provide information for general reference regarding the project.<br />
                                        This material is not prepared as a basis for users' investment decisions and may not be used for investment solicitation or advisory purposes under any circumstances.
                                    </li>
                                    <li className="pl-1">
                                        <strong className="block font-bold mb-1">Accuracy and Completeness of Information</strong>
                                        The renderings, design specifications, numerical data, and detailed plans (IOTA Details) presented in this material are examples based on current business plans and are subject to change without prior notice depending on licensing conditions and changes in the business environment during actual construction.<br />
                                        The Company makes no express or implied representations or warranties regarding the accuracy, completeness, or suitability of the information contained herein.
                                    </li>
                                    <li className="pl-1">
                                        <strong className="block font-bold mb-1">User's Responsibility and Professional Advice</strong>
                                        Users must seek their own independent professional advice and rely on their own judgment when evaluating the information contained in this material.<br />
                                        The Company and its employees shall assume no legal liability whatsoever for any decisions made based on or utilizing the information provided in or in connection with this material.
                                    </li>
                                    <li className="pl-1">
                                        <strong className="block font-bold mb-1">Rights and Cancellation of Business Procedures</strong>
                                        The Company reserves the right to modify, cancel, or suspend the procedures, structure, and schedule of the business at any time depending on the progress of the project.<br />
                                        The Company owes no legal obligations to potential investors or users in this regard, and users may not raise any objections.
                                    </li>
                                    <li className="pl-1">
                                        <strong className="block font-bold mb-1">Other Legal Notices</strong>
                                        This digital vision book and the information contained herein are not officially registered legal documents that have undergone the Company's internal review process.<br />
                                        This material does not constitute an investment advertisement in accordance with the regulations concerning the business and operations of financial investment companies.
                                    </li>
                                </ol>
                            </div>
                        )}

                        <div className="mt-8 pt-6 border-t border-gray-200/20 text-center">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className={`px-8 py-2.5 rounded-full font-medium transition-colors ${isLight ? 'bg-black text-white hover:bg-black/80' : 'bg-white text-black hover:bg-white/80'}`}
                            >
                                {lang === 'kr' ? "확인" : "Confirm"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
