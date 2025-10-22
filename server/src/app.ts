import cors from 'cors';
import express from 'express';
import type { Browser } from 'puppeteer';
import puppeteer from 'puppeteer';
import { renderReportHtml } from './reportHtml.js';
import { sampleReport } from './sampleReport.js';
import type { ReportDocument } from './reportTypes.js';

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

const app = express();
app.use(cors());
app.use(
  express.json({
    limit: '10mb',
  })
);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

let browserPromise: Promise<Browser> | null = null;

async function createBrowser(): Promise<Browser> {
  return puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
}

async function getBrowser(): Promise<Browser> {
  if (!browserPromise) {
    browserPromise = createBrowser();
  }
  return browserPromise;
}

async function generatePdf(document: ReportDocument) {
  const browser = await getBrowser();
  const page = await browser.newPage();
  const html = renderReportHtml(document);

  await page.emulateMediaType('print');
  await page.setContent(html, {
    waitUntil: ['networkidle0', 'domcontentloaded'],
  });

  const pdfBuffer = await page.pdf({
    format: 'A4',
    printBackground: true,
    preferCSSPageSize: true,
  });

  await page.close();
  return Buffer.isBuffer(pdfBuffer) ? pdfBuffer : Buffer.from(pdfBuffer);
}

app.post('/api/pdf', async (req, res) => {
  const document = (req.body?.document ?? sampleReport) as ReportDocument;

  try {
    const pdf = await generatePdf(document);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=${document.id ?? 'report'}.pdf`
    );
    res.send(pdf);
  } catch (error) {
    console.error('[PDF] 생성 실패', error);
    res.status(500).json({ message: 'PDF 생성 중 오류가 발생했습니다.' });
  }
});

app.post('/api/html', (req, res) => {
  const document = (req.body?.document ?? sampleReport) as ReportDocument;
  const html = renderReportHtml(document);
  res
    .set({
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
    })
    .send(html);
});

async function shutdown() {
  if (browserPromise) {
    const browser = await browserPromise;
    await browser.close();
  }
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

app.listen(PORT, () => {
  console.log(`PDF service listening on port ${PORT}`);
});
