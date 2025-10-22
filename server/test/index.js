const SUMMARY_URL = 'https://www.weather.go.kr/w/weather/forecast/short-term.do';

async function ensureFetch() {
  if (globalThis.fetch) {
    return globalThis.fetch;
  }

  try {
    const { default: fetch } = await import('node-fetch');
    return fetch;
  } catch (error) {
    throw new Error(
      'fetch API is not available in this Node.js version. Install node-fetch or upgrade to Node 18+.'
    );
  }
}

function decodeHtmlEntities(text) {
  const entityMap = [
    [/&nbsp;/gi, ' '],
    [/&amp;/gi, '&'],
    [/&lt;/gi, '<'],
    [/&gt;/gi, '>'],
    [/&quot;/gi, '"'],
    [/&#39;/gi, "'"],
  ];

  return entityMap.reduce((acc, [pattern, replacement]) => acc.replace(pattern, replacement), text);
}

function extractSummary(html) {
  const summaryMatch = html.match(/<p\s+class="summary">([\s\S]*?)<\/p>/i);

  if (!summaryMatch) {
    throw new Error('Could not locate summary section in the page.');
  }

  const summaryHtml = summaryMatch[1];

  const cleaned = decodeHtmlEntities(
    summaryHtml
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/span>\s*<span[^>]*>/gi, '\n')
      .replace(/<\/?span[^>]*>/gi, '')
      .replace(/\r?\n\s*/g, '\n')
      .trim()
  );

  return cleaned.replace(/\n{3,}/g, '\n\n');
}

async function fetchSummary() {
  const fetch = await ensureFetch();
  const response = await fetch(SUMMARY_URL, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; WeatherSummaryBot/1.0; +https://example.com)',
      'Accept-Language': 'ko,en;q=0.8',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch page. HTTP ${response.status}`);
  }

  const html = await response.text();
  return extractSummary(html);
}

async function main() {
  try {
    const summary = await fetchSummary();
    console.log(summary);
  } catch (error) {
    console.error('Error:', error.message);
    process.exitCode = 1;
  }
}

main();
