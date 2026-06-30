-- ============================================================================
-- 오피스 섹터 1만평+ 통합 데이터베이스 구축 스크립트
-- Target: Supabase PostgreSQL (public schema)
-- ============================================================================

-- 1. 오피스 자산 마스터 테이블 (기성 & 개발 파이프라인 통합)
CREATE TABLE IF NOT EXISTS public.office_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,                           -- 빌딩명
    status VARCHAR(50) NOT NULL,                           -- 자산 상태 ('stabilized': 운영 중, 'pipeline': 개발 예정)
    submarket VARCHAR(50),                                 -- 권역 (CBD, GBD, YBD, BBD, Others 등)
    city VARCHAR(100),                                     -- 시/도
    district VARCHAR(100),                                 -- 구
    dong VARCHAR(100),                                     -- 동
    parcel_main VARCHAR(50),                               -- 본번
    parcel_sub VARCHAR(50),                                -- 부번
    address TEXT,                                          -- 전체 도로명/지번 주소 (좌표 자동 변환 대상)
    latitude NUMERIC(10, 8),                               -- 위도 (GIS 맵핑용)
    longitude NUMERIC(11, 8),                              -- 경도 (GIS 맵핑용)
    gfa_sqm NUMERIC(15, 2),                                -- 연면적(㎡)
    gfa_py NUMERIC(15, 2),                                 -- 연면적(평)
    office_area_sqm NUMERIC(15, 2),                        -- 오피스면적(㎡)
    office_area_py NUMERIC(15, 2),                         -- 오피스면적(평)
    standard_floor_area_py NUMERIC(15, 2),                 -- 기준층면적(평)
    land_area_sqm NUMERIC(15, 2),                          -- 대지면적 (㎡)
    main_use VARCHAR(100),                                 -- 주용도 / 주용도명 (업무시설 등)
    completion_date DATE,                                  -- 사용승인일
    remodeling_date DATE,                                  -- 리모델링 / 대수선일
    scale VARCHAR(100),                                    -- 규모 (예: 지하 6층 / 지상 24층)
    far_pct NUMERIC(8, 2),                                 -- 용적률 (%)
    building_area_sqm NUMERIC(15, 2),                      -- 건축면적 (㎡)
    bcr_pct NUMERIC(8, 2),                                 -- 건폐율 (%)
    parking_info TEXT,                                     -- 주차
    elevators_info TEXT,                                   -- 엘리베이터
    efficiency_pct NUMERIC(5, 2),                          -- 전용률 (%)
    is_rent_or_headquarter VARCHAR(50),                     -- 임대/사옥
    is_aegis_asset BOOLEAN DEFAULT FALSE,                  -- 이지스 자산 여부 (신규 조건 구분용)

    -- [신규 공급 예정 1만평+ 전용 추가 컬럼]
    expected_completion_year INTEGER,                      -- 준공예정 (연도)
    expected_completion_quarter VARCHAR(10),               -- 분기 (준공예정 분기)
    construction_type VARCHAR(100),                        -- 건축구분명 (재개발, 신축 등)
    floors_below INTEGER,                                  -- 지하층수
    floors_above INTEGER,                                  -- 지상층수
    actual_construction_start_date DATE,                   -- 실제착공일
    permit_date DATE,                                      -- 건축허가일
    rental_type VARCHAR(100),                              -- 임대여부 (외부임대 등)
    owner_developer VARCHAR(255),                          -- 소유주(시행주체)
    trustee VARCHAR(255),                                  -- 수탁자
    builder VARCHAR(255),                                  -- 시공사
    progress_status VARCHAR(100),                          -- 진행상황 (공사마무리, 착공 등)

    custom_metadata JSONB DEFAULT '{}'::jsonb,             -- 향후 무한 확장용 유동적 데이터 컬럼
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 분기별 임대 정보 테이블 (기성 오피스 시계열 데이터)
CREATE TABLE IF NOT EXISTS public.office_quarterly_leasing (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    office_id UUID REFERENCES public.office_assets(id) ON DELETE CASCADE,
    quarter VARCHAR(10) NOT NULL,                          -- 분기 식별자 (예: '2025-1Q', '2025-4Q')
    deposit_per_py NUMERIC(15, 2),                         -- 보증금(원/평)
    monthly_rent_per_py NUMERIC(15, 2),                     -- 월임대료(원/평)
    maintenance_fee_per_py NUMERIC(15, 2),                  -- 관리비(원/평)
    rent_free_months NUMERIC(4, 2),                        -- 렌트프리(개월/년)
    vacancy_rate NUMERIC(5, 4),                            -- 공실률 (0.0000 ~ 1.0000)
    noc NUMERIC(15, 2),                                    -- NOC (Net Occupancy Cost, 원/평)
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 매매 거래 사례 테이블 (시계열 매매 이력)
CREATE TABLE IF NOT EXISTS public.office_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    office_id UUID REFERENCES public.office_assets(id) ON DELETE SET NULL, -- 마스터 오피스 자산과 FK 연동
    building_name VARCHAR(255) NOT NULL,                    -- 빌딩명 (매핑용 원본 텍스트 백업)
    transaction_year INTEGER,                              -- 거래년도
    transaction_date DATE,                                 -- 구체적 거래일자 (식별 가능한 경우)
    submarket VARCHAR(50),                                 -- 권역
    city VARCHAR(100),                                     -- 시
    district VARCHAR(100),                                 -- 구
    dong VARCHAR(100),                                     -- 동
    parcel_main VARCHAR(50),                               -- 본번
    parcel_sub VARCHAR(50),                                -- 부번
    parcel_additional TEXT,                                -- 기타 필지
    gfa_sqm NUMERIC(15, 2),                                -- 연면적(㎡)
    gfa_py NUMERIC(15, 2),                                 -- 연면적(평)
    land_area_sqm NUMERIC(15, 2),                          -- 대지면적(㎡)
    land_area_py NUMERIC(15, 2),                           -- 대지면적(평)
    transaction_area_sqm NUMERIC(15, 2),                   -- 거래면적(㎡)
    transaction_area_py NUMERIC(15, 2),                    -- 거래면적(평)
    transaction_land_area_sqm NUMERIC(15, 2),              -- 대지거래면적(㎡)
    transaction_land_area_py NUMERIC(15, 2),               -- 대지거래면적(평)
    floors_above INTEGER,                                  -- 지상층
    floors_below INTEGER,                                  -- 지하층
    year_built INTEGER,                                    -- 준공년도
    is_new_or_remodeled VARCHAR(10),                       -- 신축/대수선(Y/N)
    remodeling_year INTEGER,                               -- 대수선년도
    transaction_price_krw NUMERIC(20, 2),                  -- 거래가 (원 단위 환산 적용: 천원 * 1000)
    price_per_py_krw NUMERIC(15, 2),                       -- 평당가(연면적, 원 단위 환산: 천원 * 1000)
    seller_name VARCHAR(255),                              -- 매도인명
    seller_type VARCHAR(100),                              -- 매도인 유형 (법인, 개인 등)
    seller_location VARCHAR(100),                          -- 투자자 소재 (국내, 해외 등)
    buyer_name VARCHAR(255),                               -- 매수인명
    buyer_type VARCHAR(100),                               -- 매수인 유형 (AMC, 법인 등)
    buyer_location VARCHAR(100),                           -- 투자자 소재
    buyer_details TEXT,                                    -- 투자자 상세
    buyer_purpose VARCHAR(100),                            -- 매입목적
    investment_vehicle VARCHAR(100),                       -- 투자 Vehicle
    investment_vehicle_detail TEXT,                        -- 투자 Vehicle(상세)
    acquisition_type VARCHAR(100),                         -- 매입형태 (전체, 일부 등)
    transaction_type VARCHAR(100),                         -- 거래종류 (실물, 지분 등)
    transaction_notes TEXT,                                -- 비고1(거래 관련)
    loan_interest_rate NUMERIC(6, 4),                      -- 대출금리
    has_im_file BOOLEAN DEFAULT FALSE,                     -- IM 확보(Y/N) (Y인 경우 true)
    leased_area_py NUMERIC(15, 2),                         -- 임대면적(py)
    net_acquisition_price_krw NUMERIC(20, 2),              -- 순매입가 (원 단위 환산: 천원 * 1000)
    deposit_per_py NUMERIC(15, 2),                         -- 보증금 (원 단위 환산: 천원/평 * 1000)
    monthly_rent_per_py NUMERIC(15, 2),                     -- 임대료 (원 단위 환산: 천원/평 * 1000)
    maintenance_fee_per_py NUMERIC(15, 2),                  -- 관리비 (원 단위 환산: 천원/평 * 1000)
    efficiency_pct NUMERIC(5, 4),                          -- 전용률 (실수 표현)
    rent_free_months_1 NUMERIC(4, 2),                      -- R.F(개월/년) (Unnamed: 46 컬럼)
    rent_free_months_2 NUMERIC(4, 2),                      -- R.F(개월/년) (Unnamed: 47 컬럼)
    building_vacancy_rate NUMERIC(5, 4),                   -- 빌딩 공실률
    submarket_vacancy_rate NUMERIC(5, 4),                  -- 권역평균공실률
    treasury_bond_5y_rate NUMERIC(6, 4),                   -- 국고채5년
    cap_rate_stabilized_nominal NUMERIC(6, 4),             -- Stablized 명목Cap_운용
    cap_rate_stabilized_real NUMERIC(6, 4),                -- Stablized 실질Cap_운용
    cap_rate_asis_nominal NUMERIC(6, 4),                   -- As-is 명목Cap_운용
    cap_rate_asis_real NUMERIC(6, 4),                      -- As-is 실질Cap_운용
    cap_rate_notes TEXT,                                   -- 비고2(Cap 산정 관련)
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. 기업 임대차 이동 사례 테이블 (이동 트랙킹)
CREATE TABLE IF NOT EXISTS public.office_tenant_leases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_name VARCHAR(255) NOT NULL,                     -- 임차인
    quarter VARCHAR(10),                                   -- 계약시기 (분기, 예: '2022-1Q')
    lease_type VARCHAR(50),                                -- 수요형태 (수요이전, 신규 등)
    
    -- 이전 전 (From) 정보
    from_office_id UUID REFERENCES public.office_assets(id) ON DELETE SET NULL,
    from_office_name VARCHAR(255),                         -- 빌딩명
    from_submarket VARCHAR(50),                            -- 권역
    from_city VARCHAR(100),                                -- 시
    from_district VARCHAR(100),                            -- 구
    from_dong VARCHAR(100),                                -- 동
    from_address TEXT,                                     -- 주소
    from_gfa_py NUMERIC(15, 2),                            -- 건물 연면적(평)
    from_leased_area_sqm NUMERIC(15, 2),                   -- 전용면적(㎡)
    
    -- 이전 후 (To) 정보
    to_office_id UUID REFERENCES public.office_assets(id) ON DELETE SET NULL,
    to_office_name VARCHAR(255),                           -- 빌딩명
    to_submarket VARCHAR(50),                              -- 권역
    to_city VARCHAR(100),                                  -- 시
    to_district VARCHAR(100),                              -- 구
    to_dong VARCHAR(100),                                  -- 동
    to_address TEXT,                                       -- 주소
    to_gfa_py NUMERIC(15, 2),                              -- 건물 연면적(평)
    to_leased_area_sqm NUMERIC(15, 2),                     -- 전용면적(㎡)
    
    industry_sub VARCHAR(255),                             -- 업종(소분류)
    industry_main VARCHAR(255),                            -- 업종(대분류)
    notes TEXT,                                            -- 비고
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. 지리적 쿼리 속도 최적화를 위한 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_office_assets_status ON public.office_assets(status);
CREATE INDEX IF NOT EXISTS idx_office_assets_submarket ON public.office_assets(submarket);
CREATE INDEX IF NOT EXISTS idx_office_assets_aegis ON public.office_assets(is_aegis_asset);
CREATE INDEX IF NOT EXISTS idx_office_assets_coords ON public.office_assets(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_office_leasing_quarter ON public.office_quarterly_leasing(quarter);
CREATE INDEX IF NOT EXISTS idx_office_transactions_year ON public.office_transactions(transaction_year);

-- ============================================================================
-- Row Level Security (RLS) Policies
-- ============================================================================

-- office_assets RLS
ALTER TABLE public.office_assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON public.office_assets FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON public.office_assets FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON public.office_assets FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON public.office_assets FOR DELETE USING (true);

-- office_quarterly_leasing RLS
ALTER TABLE public.office_quarterly_leasing ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON public.office_quarterly_leasing FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON public.office_quarterly_leasing FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON public.office_quarterly_leasing FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON public.office_quarterly_leasing FOR DELETE USING (true);

-- office_transactions RLS
ALTER TABLE public.office_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON public.office_transactions FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON public.office_transactions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON public.office_transactions FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON public.office_transactions FOR DELETE USING (true);

-- office_tenant_leases RLS
ALTER TABLE public.office_tenant_leases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON public.office_tenant_leases FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON public.office_tenant_leases FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON public.office_tenant_leases FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON public.office_tenant_leases FOR DELETE USING (true);
