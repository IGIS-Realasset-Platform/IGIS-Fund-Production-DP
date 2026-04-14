/**
 * IFPDP Asset Database Mock (V3: Advanced Operational Depth)
 * 사내 프론트/미들 오피스 실무 심층 관리 항목(NOC, 스태킹, 옵코, 매출 기여도 등)이 대거 보강된 최신 스키마입니다.
 * 대상 자산: 더케이트윈타워 (오피스/리테일 자산 특성 반영)
 */

export const mockAssets = [
  {
    id: "asset_001",
    
    // =====================================================================
    // ① 정적 데이터 (Static/Profile): 불변하는 자산 및 조직 뼈대
    // =====================================================================
    staticProfile: {
      missionId: "더케이트윈타워 매입 프로젝트",
      assetName: "The-K 트윈타워",
      assetClass: "오피스/리테일",
      address: "서울 종로구 율곡로 6",
      grossArea: "25,000평",
      vehicleInfo: {
        type: "Fund", // Fund, PFV, REITs, SPC 등
        name: "이지스전문투자형사모부동산 389호"
      },
      hrAllocation: {
        director: "정영진",
        pm: "장민호",
        department: "투자/사업센터",
        involvedTeams: ["투자본부 1팀", "DSC 파트", "공간솔루션팀"], // 세부 관여 파트
      }
    },

    // =====================================================================
    // ② 동적 & 시계열 데이터 (Dynamic/Financial): UW 목표 vs 실적 트래킹
    // =====================================================================
    dynamicData: {
      // 투입 인적 자원 밀도 추적
      manpowerStatus: {
        totalFTE: { target_UW: 5.0, actual_Current: 7.5 } // 투입 맨먼스(Man/Month)
      },
      // 핵심 기업 재무 지표 (이지스 자본)
      financials: {
        irr: { target_UW: 8.5, actual_Current: 7.2 },
        aum: { target_UW: 260000000000, actual_Current: 260000000000 },
        equity: { target_UW: 60000000000, actual_Current: 60000000000 },
        loan: { target_UW: 200000000000, actual_Current: 200000000000 },
        ltv: { target_UW: 65.0, actual_Current: 65.5 },
        igisRevenue: { target_UW: 3000000000, actual_Current: 3000000000 } // 당해년도 이지스 사업수익 매출
      },
      // 실물 영업(Sales) 및 임대 지표 트래킹
      operations: {
        occupancyRate: { target_UW: 100.0, actual_Current: 97.5 },
        walt: { target_UW: 5.0, actual_Current: 4.2 },
        nocMetrics: { target_UW: 350000, actual_Current: 330000 } // 평당 NOC 목표 단가 vs 실제 수취 단가
      },
      // 기간별 단계 진입 로깅
      timeSeries: {
        teaserReceived: { target_UW: "2023-01-10", actual_Current: "2023-01-15" },
        caReviewDate: { target_UW: "2023-02-01", actual_Current: "2023-02-01" },
        closingDate: { target_UW: "2023-05-01", actual_Current: "2023-05-18" },
        pfDrawdown: { target_UW: "2023-05-15", actual_Current: "2023-06-01" },
        constructionStart: { target_UW: "2023-08-01", actual_Current: "2023-08-15" },
        completionDate: { target_UW: "2025-08-30", actual_Current: "2025-10-30" },
        loanMaturity: { target_UW: "2026-06-01", actual_Current: null }, // 미도래
        exitDate: { target_UW: "2027-12-31", actual_Current: null }
      }
    },

    // =====================================================================
    // ③ 맥락 & 심층 네트워크 데이터 (Contextual): AI 분석용 질적 로그 및 외부 연동
    // =====================================================================
    contextualData: {
      // 본부 내 상태 규정
      statusIndicators: {
        valueChainStep: "8. 개발 추진",
        handoverStatus: "프론트에서 미들오피스 이관 검토 중" // 이관 제어 플래그
      },
      // 상품 기획 및 영업 전략 (부동산 스펙 관련)
      strategy: {
        productStrategy: "더케이 단독 리모델링안 vs 일본대사관 부지 통합 재건축안 (Value-added 병행 검토 중)",
        stackingPlan: "지하 1~3층 리테일 MD 집중, 지상 4~20층 오피스 섹션 균등 분할 계획 (현재 설계 도면 반영 완료)",
        retailMdPlan: "권역 내 저층부 F&B 60% 비중 확대하여 집객력 극대화.",
        tenantTargeting: "최근 강남권 이탈 고려 중인 5천평 이상 대형 IT 앵커 테넌트 집중 공략."
      },
      anchorTenants: ["마이크로소프트", "김앤장 법률사무소", "위워크"],
      
      // 투자자 (신디케이션) 현황
      investorNetwork: {
        lpList: ["NH투자증권", "교직원공제회", "외국계 블라인드 펀드"],
        lenderList: ["KB국민은행(1Tr)", "신협(2Tr)", "메리츠증권(3Tr)"]
      },

      // 외부 조력/운영(OpCo) 네트워크 밀착 관리
      partnerships: {
        partnerContacts: [
          { company: "현대건설", role: "시공사", name: "김상무", phone: "010-XXXX", issue: "품질은 우수하나 인건비 이슈로 공사단가 인상 압박이 강함." },
          { company: "희림건축", role: "설계사", name: "박소장", phone: "010-XXXX", issue: "관할청 인허가 네트워킹은 우수하나 도면 수정 피드백이 다소 지연됨." }
        ],
        operatorInfo: { // 호텔/데이터센터 등의 '옵코(OpCo)' 관리 항목
          hasOpCo: false,
          operatorName: "건물 직영 체제 (별도 OpCo 없음)",
          igisPic: "장민호 PM",
          status: "오피스 자산으로 별도의 옵코가 설정되지 않음."
        }
      },

      // 의사결정 기록 및 리스크 그래프
      redFlags: {
        status: "Yellow",
        issue: "리파이낸싱 금리 1.5%p 상승에 따른 펀드 배당률 저하 우려",
        mitigation: "운영수익(NOI) 최소 5% 추가 개선을 위해 기존 임차인 대상 임대료 선제적 상향 협의."
      },
      decisionGraph: [
        {
          date: "2023-11-15",
          board: "투자심의위원회",
          context: "당시 거시적인 조달 금리 급등으로 인해 부득이 선순위 LTV 비중을 줄이고 에쿼티를 소폭 늘리는 결정 강행."
        }
      ],

      // 매크로(전사) 지표 기여도 및 내부통제
      macroMetrics: {
        centerOkrContribution: "투자부문 2024년 전체 매출 목표의 15% 기여 예정",
        complianceLogs: ["이해상충 심의 완료 (2023.04.10)"]
      },

      // 하드 코스트 및 ESG 스펙
      esgAndSpecs: {
        spaceUx: "스마트 출입 관리 시스템, 무인주차 로봇 연동",
        permitStatus: "건축 심사 중",
        esgCertification: "LEED Platinum (인증 유효: 2029년)",
        carbonReduction: "고효율 공조기 도입으로 전년대비 전력소모 12% 절감 실적 달성"
      }
    }
  }
];
