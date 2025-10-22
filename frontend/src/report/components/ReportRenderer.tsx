import { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import type {
  ReportDocument,
  ReportBlock,
  ReportPage,
  PageMetric,
} from '../types';
import './report.css';

type RendererProps = {
  document: ReportDocument;
  onMetrics?: (metrics: PageMetric[]) => void;
  highlightedPages?: string[];
};

function renderBlock(block: ReportBlock) {
  switch (block.type) {
    case 'text': {
      const { content, style } = block;
      const fontSize = style?.size ? `${style.size}pt` : '11pt';
      const lineHeight = style?.lineHeight ? `${style.lineHeight}` : '1.5';
      const fontWeight = style?.weight ?? 'normal';
      const textAlign = style?.align ?? 'left';

      return (
        <p
          key={block.id}
          className="report-block report-text"
          style={{ fontSize, lineHeight, fontWeight, textAlign }}
        >
          {content}
        </p>
      );
    }
    case 'image': {
      const { src, caption, layout } = block;
      const width = layout?.width ?? '100%';
      const alignment = layout?.align ?? 'center';
      const justify =
        alignment === 'left'
          ? 'flex-start'
          : alignment === 'right'
          ? 'flex-end'
          : 'center';

      return (
        <figure
          key={block.id}
          className="report-block report-figure"
          style={{ justifyContent: justify }}
        >
          <img src={src} alt={caption ?? ''} style={{ width }} />
          {caption ? <figcaption>{caption}</figcaption> : null}
        </figure>
      );
    }
    case 'table': {
      const { columns, rows, caption } = block;
      return (
        <div key={block.id} className="report-block report-table">
          {caption ? <div className="report-table-caption">{caption}</div> : null}
          <table>
            <thead>
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    style={{
                      width: col.width,
                      textAlign: col.align ?? 'left',
                    }}
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr key={`${block.id}-row-${idx}`}>
                  {columns.map((col) => (
                    <td
                      key={`${block.id}-${col.key}-${idx}`}
                      style={{
                        textAlign: col.align ?? 'left',
                      }}
                    >
                      {row[col.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    case 'divider': {
      return (
        <hr
          key={block.id}
          className={`report-block report-divider ${block.variant ?? 'solid'}`}
        />
      );
    }
    case 'pageBreak': {
      return <div key={block.id} className="report-page-break" />;
    }
    default:
      return null;
  }
}

function hasHeaderContent(page: ReportPage) {
  const header = page.header;
  if (!header) return false;
  return Boolean(header.left || header.center || header.right);
}

function hasFooterContent(page: ReportPage) {
  const footer = page.footer;
  if (!footer) return false;
  return Boolean(footer.left || footer.center || footer.right);
}

function ReportPageView({ page, isOverflow }: { page: ReportPage; isOverflow: boolean }) {
  const headerVisible = hasHeaderContent(page);
  const footerVisible = hasFooterContent(page);

  return (
    <section className={`report-page ${isOverflow ? 'report-page--overflow' : ''}`}>
      {headerVisible ? (
        <header className="report-page-header">
          <span>{page.header?.left}</span>
          <span>{page.header?.center}</span>
          <span>{page.header?.right}</span>
        </header>
      ) : null}
      <div className="report-page-content">
        {page.blocks.map((block) => renderBlock(block))}
      </div>
      {footerVisible ? (
        <footer className="report-page-footer">
          <span>{page.footer?.left}</span>
          <span>{page.footer?.center}</span>
          <span>{page.footer?.right}</span>
        </footer>
      ) : null}
    </section>
  );
}

export function ReportRenderer({ document, onMetrics, highlightedPages }: RendererProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const overflowSet = useMemo(
    () => new Set(highlightedPages ?? []),
    [highlightedPages]
  );

  const measure = useCallback(() => {
    if (!wrapperRef.current) return;
    const pages = Array.from(
      wrapperRef.current.querySelectorAll<HTMLElement>('.report-page')
    );
    if (!pages.length) return;

    const metrics: PageMetric[] = pages.map((el, idx) => {
      const page = document.pages[idx];
      const pageId = page?.id ?? `page-${idx}`;
      const contentHeight = el.scrollHeight;
      const maxHeight = el.clientHeight;
      const overflow = contentHeight > maxHeight + 1;
      return { pageId, contentHeight, maxHeight, overflow };
    });

    onMetrics?.(metrics);
  }, [document.pages, onMetrics]);

  useLayoutEffect(() => {
    measure();
  }, [measure, document]);

  useEffect(() => {
    if (!wrapperRef.current) return;
    const target = wrapperRef.current;
    const pages = target.querySelectorAll<HTMLElement>('.report-page');
    const observer = new ResizeObserver(() => measure());

    observer.observe(target);
    pages.forEach((page) => observer.observe(page));

    return () => observer.disconnect();
  }, [document, measure]);

  return (
    <div className="report-wrapper" ref={wrapperRef}>
      {document.pages.map((page) => (
        <ReportPageView
          page={page}
          key={page.id}
          isOverflow={overflowSet.has(page.id)}
        />
      ))}
    </div>
  );
}
