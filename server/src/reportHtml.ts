import fs from 'node:fs';
import path from 'node:path';
import type { ReportBlock, ReportDocument, ReportPage } from './reportTypes';

const reportCssPath = path.resolve(
  process.cwd(),
  '../frontend/src/report/components/report.css'
);

const appCssPath = path.resolve(process.cwd(), '../frontend/src/App.css');
const indexCssPath = path.resolve(process.cwd(), '../frontend/src/index.css');

const cachedCss = (() => {
  const cssParts: string[] = [
    '@page { size: A4; margin: 18mm 16mm 20mm; }',
    'body { margin: 0; }',
    `
    /* PDF 최적화 스타일 */
    .app-main {
      overflow: visible;
      padding: 0;
      background: white;
    }
    .report-wrapper {
      background: white;
      padding: 0;
      gap: 0;
    }
    .report-page {
      box-shadow: none;
      margin: 0 auto;
      width: 100%;
      min-height: 259mm;
      max-height: 259mm;
      padding: 0;
      page-break-before: always;
      page-break-inside: avoid;
      box-sizing: border-box;
      overflow: hidden;
    }
    .report-page:first-child {
      page-break-before: avoid;
    }
    .report-page-content {
      max-height: 259mm;
      overflow: hidden;
    }
    .report-page::after {
      display: none;
    }
    .report-page.report-page--overflow::before {
      display: none;
    }
    `,
  ];

  const files = [indexCssPath, appCssPath, reportCssPath];
  for (const file of files) {
    try {
      const content = fs.readFileSync(file, 'utf8');
      cssParts.push(content);
    } catch (error) {
      console.warn(`[reportHtml] 스타일 파일을 읽지 못했습니다: ${file}`, error);
    }
  }

  return cssParts.join('\n');
})();

const fontLink =
  '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;600;700&display=swap" />';

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderBlock(block: ReportBlock): string {
  switch (block.type) {
    case 'text': {
      const { content, style } = block;
      const fontSize = style?.size ? `${style.size}pt` : '11pt';
      const lineHeight = style?.lineHeight?.toString() ?? '1.5';
      const fontWeight = style?.weight ?? 'normal';
      const textAlign = style?.align ?? 'left';
      return `<p class="report-block report-text" style="font-size:${fontSize};line-height:${lineHeight};font-weight:${fontWeight};text-align:${textAlign};">${escapeHtml(
        content
      ).replace(/\n/g, '<br />')}</p>`;
    }
    case 'image': {
      const { src, caption, layout } = block;
      const width = layout?.width ?? '100%';
      const justify =
        layout?.align === 'left'
          ? 'flex-start'
          : layout?.align === 'right'
          ? 'flex-end'
          : 'center';
      return `<figure class="report-block report-figure" style="justify-content:${justify};"><img src="${escapeHtml(
        src
      )}" alt="${caption ? escapeHtml(caption) : ''}" style="width:${width};" />${
        caption ? `<figcaption>${escapeHtml(caption)}</figcaption>` : ''
      }</figure>`;
    }
    case 'table': {
      const { columns, rows, caption } = block;
      const headerHtml = columns
        .map(
          (col) =>
            `<th style="${col.width ? `width:${col.width};` : ''}${
              col.align ? `text-align:${col.align};` : ''
            }">${escapeHtml(col.header)}</th>`
        )
        .join('');
      const bodyHtml = rows
        .map((row, rowIdx) => {
          const cells = columns
            .map((col) => {
              const align = col.align ? `text-align:${col.align};` : '';
              const value = row[col.key] ?? '';
              return `<td style="${align}">${escapeHtml(String(value))}</td>`;
            })
            .join('');
          return `<tr data-row="${rowIdx}">${cells}</tr>`;
        })
        .join('');

      return `<div class="report-block report-table">${
        caption ? `<div class="report-table-caption">${escapeHtml(caption)}</div>` : ''
      }<table><thead><tr>${headerHtml}</tr></thead><tbody>${bodyHtml}</tbody></table></div>`;
    }
    case 'divider': {
      const variantClass = block.variant ?? 'solid';
      return `<hr class="report-block report-divider ${variantClass}" />`;
    }
    case 'pageBreak': {
      return '<div class="report-page-break"></div>';
    }
    default:
      return '';
  }
}

function renderPage(page: ReportPage): string {
  const hasHeader =
    Boolean(page.header?.left) ||
    Boolean(page.header?.center) ||
    Boolean(page.header?.right);
  const hasFooter =
    Boolean(page.footer?.left) ||
    Boolean(page.footer?.center) ||
    Boolean(page.footer?.right);

  const header = hasHeader
    ? `<header class="report-page-header"><span>${escapeHtml(
        page.header?.left ?? ''
      )}</span><span>${escapeHtml(page.header?.center ?? '')}</span><span>${escapeHtml(
        page.header?.right ?? ''
      )}</span></header>`
    : '';

  const footer = hasFooter
    ? `<footer class="report-page-footer"><span>${escapeHtml(
        page.footer?.left ?? ''
      )}</span><span>${escapeHtml(page.footer?.center ?? '')}</span><span>${escapeHtml(
        page.footer?.right ?? ''
      )}</span></footer>`
    : '';

  const blocksHtml = page.blocks.map(renderBlock).join('');

  return `<section class="report-page">${header}<div class="report-page-content">${blocksHtml}</div>${footer}</section>`;
}

export function renderReportHtml(document: ReportDocument): string {
  const pagesHtml = document.pages.map((page) => renderPage(page)).join('');

  return `<!DOCTYPE html>
<html lang="ko">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(document.title)}</title>
    ${fontLink}
    <style>${cachedCss}</style>
  </head>
  <body>
    <div class="app-main">
      <div class="report-wrapper">
        ${pagesHtml}
      </div>
    </div>
  </body>
</html>`;
}
