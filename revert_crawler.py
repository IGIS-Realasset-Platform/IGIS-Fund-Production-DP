import sys

path = 'src/components/system/workspace/WorkspaceFinancing.jsx'
with open(path, 'r') as f:
    content = f.read()

# I will find the `const FALLBACK_LENDERS = [` and replace everything up to `} finally { setNewsLoading(false); } };`

start_marker = '    const FALLBACK_LENDERS = ['
end_marker = """        } finally {
            setNewsLoading(false);
        }
    };"""

if start_marker in content and end_marker in content:
    start_idx = content.find(start_marker)
    end_idx = content.find(end_marker) + len(end_marker)
    
    reverted_fetch = """    const fetchMarketNews = async () => {
        setNewsLoading(true);
        try {
            // 외부 무료 프록시 서버 장애로 인해, 기존처럼 빠르고 안정적인 로컬 JSON 로드 방식으로 복원합니다.
            // (대신 실시간 갱신 느낌을 주도록 1초 딜레이를 추가합니다)
            await new Promise(resolve => setTimeout(resolve, 1000));
            const res = await fetch(`${import.meta.env.BASE_URL}data/lfc-market-news.json?t=${new Date().getTime()}`);
            if (res.ok) {
                const data = await res.json();
                setMarketNews(data);
            }
        } catch (e) {
            console.error("Failed to load market news", e);
        } finally {
            setNewsLoading(false);
        }
    };"""
    
    content = content[:start_idx] + reverted_fetch + content[end_idx:]
    with open(path, 'w') as f:
        f.write(content)
    print("Reverted to local JSON fetch with 1s delay.")
else:
    print("Markers not found.")

