import sys
import re

path = 'src/components/system/workspace/WorkspaceFinancing.jsx'
with open(path, 'r') as f:
    content = f.read()

old_fetch = """    const fetchMarketNews = async () => {
        setNewsLoading(true);
        try {
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

new_fetch = """    const FALLBACK_LENDERS = [
        { lender: "메리츠증권", relation: "816 Tr.A-1 SPC 관련 모니터링", query: "메리츠증권 부동산 PF" },
        { lender: "NH투자증권", relation: "816 Tr.A-2 SPC 및 대리금융 관련 모니터링", query: "NH투자증권 부동산 PF" },
        { lender: "신한투자증권", relation: "427/816 투자자·SPC 관련 모니터링", query: "신한투자증권 부동산 PF" },
        { lender: "대신증권", relation: "이터널하이브 SPC 관련 모니터링", query: "대신증권 부동산 PF" },
        { lender: "KB국민은행", relation: "427 본PF 후보 주관기관 모니터링", query: "KB국민은행 부동산 PF" },
    ];

    const fetchMarketNews = async () => {
        setNewsLoading(true);
        try {
            const items = [];
            
            await Promise.all(FALLBACK_LENDERS.map(async (group) => {
                const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(group.query)}&hl=ko&gl=KR&ceid=KR:ko`;
                const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(rssUrl)}`;
                
                try {
                    const res = await fetch(proxyUrl);
                    if (res.ok) {
                        const json = await res.json();
                        const xmlText = json.contents;
                        
                        const parser = new DOMParser();
                        const xmlDoc = parser.parseFromString(xmlText, "text/xml");
                        const itemNodes = xmlDoc.querySelectorAll("item");
                        
                        const articles = Array.from(itemNodes).slice(0, 3).map(node => {
                            const title = node.querySelector("title")?.textContent || "";
                            const link = node.querySelector("link")?.textContent || "";
                            const pubDate = node.querySelector("pubDate")?.textContent || "";
                            const source = node.querySelector("source")?.textContent || "";
                            
                            const dateObj = new Date(pubDate);
                            const dateStr = !isNaN(dateObj) ? dateObj.toISOString().split('T')[0] : "";
                            
                            return {
                                date: dateStr,
                                title: `[${dateStr}] ${title}`,
                                url: link,
                                publisher: source,
                                matchMode: "대주명+PF키워드"
                            };
                        });
                        
                        items.push({
                            lender: group.lender,
                            relation: group.relation,
                            projects: [],
                            articles: articles
                        });
                    }
                } catch(e) {
                    console.error("Failed to fetch for lender:", group.lender, e);
                }
            }));
            
            setMarketNews({
                generatedAt: new Date().toISOString(),
                windowDays: 3,
                items: items
            });

        } catch (e) {
            console.error("Failed to load market news", e);
        } finally {
            setNewsLoading(false);
        }
    };"""

if old_fetch in content:
    content = content.replace(old_fetch, new_fetch)
    with open(path, 'w') as f:
        f.write(content)
    print("Replaced fetch function with real-time CORS crawler.")
else:
    print("Could not find old_fetch in WorkspaceFinancing.jsx")
