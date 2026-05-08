import 'dotenv/config'

const TAVILY_API_KEY = process.env.TAVILY_API_KEY
const TAVILY_URL = 'https://api.tavily.com/search'

export async function searchWeb(query, { maxResults = 5, searchDepth = 'basic' } = {}) {
  if (!TAVILY_API_KEY) {
    console.warn('[tavily] TAVILY_API_KEY not set — skipping web search');
    return null;
  }

  try {
    const res = await fetch(TAVILY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: TAVILY_API_KEY,
        query,
        search_depth: searchDepth,   // 'basic' (~1¢) or 'advanced' (~2¢)
        include_answer: true,
        max_results: maxResults,
      }),
    });

    if (!res.ok) {
      console.error('[tavily] search failed:', res.status, await res.text());
      return null;
    }

    const data = await res.json();
    return {
      answer: data.answer || null,
      results: (data.results || []).map(r => ({
        title: r.title,
        url: r.url,
        snippet: r.content,
      })),
    };
  } catch (err) {
    console.error('[tavily] error:', err);
    return null;
  }
}

export function formatSearchContext(searchData) {
  if (!searchData || (!searchData.answer && !searchData.results?.length)) return '';

  let ctx = '\n\n--- WEB SEARCH CONTEXT ---\n';
  if (searchData.answer) ctx += `Quick answer: ${searchData.answer}\n\n`;

  if (searchData.results?.length) {
    ctx += 'Sources:\n';
    searchData.results.forEach((r, i) => {
      ctx += `[${i + 1}] ${r.title}\n${r.url}\n${r.snippet}\n\n`;
    });
  }
  ctx += '--- END WEB SEARCH ---\n\nUse this context where relevant. Cite sources as [1], [2], etc. when you use them.\n';
  return ctx;
}