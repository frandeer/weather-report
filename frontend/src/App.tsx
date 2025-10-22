import { useCallback, useEffect, useMemo, useState } from 'react';
import { ReportRenderer } from './report/components/ReportRenderer';
import { EditorPanel, type SelectedBlock } from './report/components/EditorPanel';
import { sampleReport } from './report/sampleReport';
import type { PageMetric, ReportBlock, ReportDocument } from './report/types';
import './App.css';

const PDF_ENDPOINT =
  import.meta.env.VITE_PDF_ENDPOINT ?? 'http://localhost:4000/api/pdf';

function cloneDocument(doc: ReportDocument): ReportDocument {
  return JSON.parse(JSON.stringify(doc)) as ReportDocument;
}

function App() {
  const [reportDoc, setReportDoc] = useState<ReportDocument>(() =>
    cloneDocument(sampleReport)
  );
  const [selectedBlock, setSelectedBlock] = useState<SelectedBlock | null>(null);
  const [metrics, setMetrics] = useState<PageMetric[]>([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedBlock) return;
    const firstPage = reportDoc.pages[0];
    const firstBlock = firstPage?.blocks.find((block) => block.type !== 'pageBreak');
    if (firstPage && firstBlock) {
      setSelectedBlock({ pageId: firstPage.id, blockId: firstBlock.id });
    }
  }, [reportDoc, selectedBlock]);

  const overflowPages = useMemo(
    () => metrics.filter((metric) => metric.overflow).map((metric) => metric.pageId),
    [metrics]
  );

  const handleMetrics = useCallback((nextMetrics: PageMetric[]) => {
    setMetrics(nextMetrics);
  }, []);

  const handleSelectBlock = useCallback((selection: SelectedBlock) => {
    setSelectedBlock(selection);
  }, []);

  const handleBlockChange = useCallback(
    (pageId: string, nextBlock: ReportBlock) => {
      setReportDoc((prev) => {
        const pages = prev.pages.map((page) => {
          if (page.id !== pageId) {
            return page;
          }
          const blocks = page.blocks.map((block) =>
            block.id === nextBlock.id ? nextBlock : block
          );
          return { ...page, blocks };
        });
        return { ...prev, pages };
      });
    },
    []
  );

  const handleDownloadPdf = useCallback(async () => {
    if (overflowPages.length > 0) return;
    setIsDownloading(true);
    setDownloadError(null);

    try {
      const response = await fetch(PDF_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ document: reportDoc }),
      });

      if (!response.ok) {
        throw new Error('PDF 생성 요청이 실패했습니다.');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${reportDoc.id ?? 'report'}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'PDF 다운로드 중 오류가 발생했습니다.';
      setDownloadError(message);
    } finally {
      setIsDownloading(false);
    }
  }, [overflowPages.length, reportDoc]);

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <h1>기상 리포트 템플릿</h1>
        <p>좌측은 문서 정보, 우측은 블록 속성을 편집할 수 있는 작업 영역입니다.</p>

        <section className="app-meta">
          <h2>문서 정보</h2>
          <dl>
            <dt>제목</dt>
            <dd>{reportDoc.title}</dd>
            <dt>작성일</dt>
            <dd>{new Date(reportDoc.createdAt).toLocaleDateString('ko-KR')}</dd>
            <dt>페이지 수</dt>
            <dd>{reportDoc.pages.length}</dd>
          </dl>
        </section>

        <section className="app-overflow">
          <h2>레이아웃 검증</h2>
          {overflowPages.length === 0 ? (
            <p>모든 페이지가 A4 높이 제한을 만족합니다.</p>
          ) : (
            <ul>
              {overflowPages.map((pageId) => (
                <li key={pageId}>{pageId} 영역이 A4 높이를 초과했습니다.</li>
              ))}
            </ul>
          )}
        </section>

        <section className="app-actions">
          <h2>PDF</h2>
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isDownloading || overflowPages.length > 0}
          >
            {isDownloading ? '생성 중…' : 'PDF 다운로드'}
          </button>
          {downloadError ? <p className="app-error">{downloadError}</p> : null}
          {overflowPages.length > 0 ? (
            <p className="app-error">모든 페이지가 제한을 만족해야 PDF를 받을 수 있습니다.</p>
          ) : null}
        </section>
      </aside>

      <main className="app-main">
        <div className="app-main-inner">
          <ReportRenderer
            document={reportDoc}
            onMetrics={handleMetrics}
            highlightedPages={overflowPages}
          />
        </div>
      </main>

      <aside className="editor-panel">
        <EditorPanel
          document={reportDoc}
          selected={selectedBlock}
          onSelect={handleSelectBlock}
          onBlockChange={handleBlockChange}
          overflowPages={overflowPages}
        />
      </aside>
    </div>
  );
}

export default App;
