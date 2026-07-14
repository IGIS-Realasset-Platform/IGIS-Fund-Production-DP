import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient'; // Adjust path if needed

/**
 * MappingDashboard - 오피스 1만평+ Market Intelligence 플랫폼
 * RULES.md 준수: 다크모드 미니멀리즘, Signed URL 전용 보안 적용
 */
const MappingDashboard = () => {
  const [officeData, setOfficeData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOfficeData();
  }, []);

  const fetchOfficeData = async () => {
    try {
      setLoading(true);
      // TODO: supabase 연동을 통한 부동산 플래닛 + 오피스파인드 융합 데이터 호출
      // const { data, error } = await supabase.from('office_10k_view').select('*');
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8 font-sans">
      <header className="mb-8 border-b border-gray-700 pb-4">
        <h1 className="text-[26px] font-light tracking-tight text-white">
          <span className="text-blue-500 font-medium">IGIS</span> Market Intelligence
        </h1>
        <p className="text-sm text-gray-400 mt-2">
          부동산 플래닛 / 오피스파인드 통합 컨트롤 타워 (1만평 이상 프라임 오피스)
        </p>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 거시적 GIS 시각화 패널 */}
        <section className="col-span-2 bg-gray-800 rounded-lg p-6 border border-gray-700 shadow-xl">
          <h2 className="text-xl font-semibold mb-4 text-gray-200">Macro GIS Visualization</h2>
          <div className="h-96 bg-gray-900 rounded flex items-center justify-center border border-gray-700">
            {loading ? (
              <span className="text-gray-500 animate-pulse">데이터를 불러오는 중입니다...</span>
            ) : (
              <span className="text-gray-500">지도 렌더링 영역</span>
            )}
          </div>
        </section>

        {/* 미시적 임대차 디테일 패널 */}
        <section className="bg-gray-800 rounded-lg p-6 border border-gray-700 shadow-xl flex flex-col">
          <h2 className="text-xl font-semibold mb-4 text-gray-200">Micro Lease Details</h2>
          <div className="flex-1 bg-gray-900 rounded p-4 border border-gray-700 overflow-y-auto">
             {/* 운영 자산 및 개발 자산 상세 정보 표시 */}
             <p className="text-sm text-gray-400 mb-2">• NOC 및 공실률 트래킹</p>
             <p className="text-sm text-gray-400">• 파이낸싱 원가 분석</p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default MappingDashboard;
