import { useMemo } from 'react';
import type {
  ReportDocument,
  ReportBlock,
 ReportPage,
} from '../types';

type SelectedBlock = {
  pageId: string;
  blockId: string;
};

type BlockSelectionProps = {
  document: ReportDocument;
  selected: SelectedBlock | null;
  onSelect: (selection: SelectedBlock) => void;
  overflowPages: string[];
};

type BlockEditorProps = {
  block: ReportBlock;
  onChange: (next: ReportBlock) => void;
};

type EditorPanelProps = {
  document: ReportDocument;
  selected: SelectedBlock | null;
  onSelect: (selection: SelectedBlock) => void;
  onBlockChange: (pageId: string, block: ReportBlock) => void;
  overflowPages: string[];
};

const BLOCK_TYPE_LABEL: Record<ReportBlock['type'], string> = {
  text: '텍스트',
  image: '이미지',
  table: '표',
  divider: '구분선',
  pageBreak: '페이지 분할',
};

function blockKey(page: ReportPage, block: ReportBlock) {
  return `${page.id}::${block.id}`;
}

function BlockList({
  document,
  selected,
  onSelect,
  overflowPages,
}: BlockSelectionProps) {
  const overflowSet = useMemo(() => new Set(overflowPages), [overflowPages]);

  return (
    <div className="editor-block-list">
      {document.pages.map((page, pageIndex) => (
        <div className="editor-page-group" key={page.id}>
          <div className="editor-page-title">
            <span>PAGE {pageIndex + 1}</span>
            {overflowSet.has(page.id) ? (
              <span className="editor-page-status">영역 초과</span>
            ) : null}
          </div>
          <ul>
            {page.blocks.map((block, blockIndex) => {
              if (block.type === 'pageBreak') {
                return null;
              }
              const isSelected =
                selected?.pageId === page.id && selected?.blockId === block.id;
              return (
                <li key={blockKey(page, block)}>
                  <button
                    type="button"
                    className={`editor-block-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => onSelect({ pageId: page.id, blockId: block.id })}
                  >
                    <span className="editor-block-type">
                      {BLOCK_TYPE_LABEL[block.type]}
                    </span>
                    <span className="editor-block-index">#{blockIndex + 1}</span>
                    {block.type === 'text' ? (
                      <span className="editor-block-preview">
                        {block.content.slice(0, 18)}
                        {block.content.length > 18 ? '…' : ''}
                      </span>
                    ) : null}
                    {block.type === 'image' && block.caption ? (
                      <span className="editor-block-preview">{block.caption}</span>
                    ) : null}
                    {block.type === 'table' && block.caption ? (
                      <span className="editor-block-preview">{block.caption}</span>
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}

function TextBlockEditor({ block, onChange }: BlockEditorProps) {
  if (block.type !== 'text') return null;

  const charLimit = 600;
  const charCount = block.content.length;
  const remaining = charLimit - charCount;

  return (
    <form className="editor-form" onSubmit={(event) => event.preventDefault()}>
      <label>
        본문 내용
        <textarea
          value={block.content}
          maxLength={charLimit}
          onChange={(event) =>
            onChange({ ...block, content: event.target.value })
          }
        />
        <span
          className={`editor-char-counter ${
            remaining < 0 ? 'exceeded' : remaining < 40 ? 'warning' : ''
          }`}
        >
          {charCount} / {charLimit}자
        </span>
      </label>
      <div className="editor-grid">
        <label>
          글자 크기 (pt)
          <input
            type="number"
            min={8}
            max={18}
            step={0.5}
            value={block.style?.size ?? 11}
            onChange={(event) =>
              onChange({
                ...block,
                style: { ...block.style, size: Number(event.target.value) },
              })
            }
          />
        </label>
        <label>
          줄 간격
          <input
            type="number"
            min={1}
            max={2}
            step={0.1}
            value={block.style?.lineHeight ?? 1.5}
            onChange={(event) =>
              onChange({
                ...block,
                style: { ...block.style, lineHeight: Number(event.target.value) },
              })
            }
          />
        </label>
        <label>
          굵기
          <select
            value={block.style?.weight ?? 'normal'}
            onChange={(event) =>
              onChange({
                ...block,
                style: { ...block.style, weight: event.target.value as 'normal' | 'bold' },
              })
            }
          >
            <option value="normal">보통</option>
            <option value="bold">굵게</option>
          </select>
        </label>
        <label>
          정렬
          <select
            value={block.style?.align ?? 'left'}
            onChange={(event) =>
              onChange({
                ...block,
                style: {
                  ...block.style,
                  align: event.target.value as 'left' | 'center' | 'right' | 'justify',
                },
              })
            }
          >
            <option value="left">왼쪽</option>
            <option value="center">가운데</option>
            <option value="right">오른쪽</option>
            <option value="justify">양쪽</option>
          </select>
        </label>
      </div>
    </form>
  );
}

function ImageBlockEditor({ block, onChange }: BlockEditorProps) {
  if (block.type !== 'image') return null;
  return (
    <form className="editor-form" onSubmit={(event) => event.preventDefault()}>
      <label>
        이미지 URL
        <input
          type="url"
          value={block.src}
          onChange={(event) => onChange({ ...block, src: event.target.value })}
        />
      </label>
      <label>
        캡션
        <input
          type="text"
          value={block.caption ?? ''}
          maxLength={80}
          onChange={(event) => onChange({ ...block, caption: event.target.value })}
        />
      </label>
      <div className="editor-grid">
        <label>
          너비
          <input
            type="text"
            value={block.layout?.width ?? '80%'}
            onChange={(event) =>
              onChange({
                ...block,
                layout: { ...block.layout, width: event.target.value },
              })
            }
            placeholder="예: 80% 또는 420px"
          />
        </label>
        <label>
          정렬
          <select
            value={block.layout?.align ?? 'center'}
            onChange={(event) =>
              onChange({
                ...block,
                layout: {
                  ...block.layout,
                  align: event.target.value as 'left' | 'center' | 'right',
                },
              })
            }
          >
            <option value="left">왼쪽</option>
            <option value="center">가운데</option>
            <option value="right">오른쪽</option>
          </select>
        </label>
      </div>
    </form>
  );
}

function TableBlockEditor({ block, onChange }: BlockEditorProps) {
  if (block.type !== 'table') return null;

  return (
    <form className="editor-form" onSubmit={(event) => event.preventDefault()}>
      <label>
        표 제목
        <input
          type="text"
          value={block.caption ?? ''}
          maxLength={80}
          onChange={(event) => onChange({ ...block, caption: event.target.value })}
        />
      </label>
      <div className="editor-table">
        <table>
          <thead>
            <tr>
              {block.columns.map((col) => (
                <th key={col.key}>{col.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {block.rows.map((row, rowIndex) => (
              <tr key={`${block.id}-edit-row-${rowIndex}`}>
                {block.columns.map((col) => (
                  <td key={`${block.id}-edit-${col.key}-${rowIndex}`}>
                    <input
                      type="text"
                      value={row[col.key]?.toString() ?? ''}
                      maxLength={40}
                      onChange={(event) => {
                        const nextRows = block.rows.map((existing, idx) =>
                          idx === rowIndex
                            ? {
                                ...existing,
                                [col.key]: event.target.value,
                              }
                            : existing
                        );
                        onChange({ ...block, rows: nextRows });
                      }}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </form>
  );
}

function DividerBlockEditor({ block, onChange }: BlockEditorProps) {
  if (block.type !== 'divider') return null;
  return (
    <form className="editor-form" onSubmit={(event) => event.preventDefault()}>
      <label>
        스타일
        <select
          value={block.variant ?? 'solid'}
          onChange={(event) =>
            onChange({
              ...block,
              variant: event.target.value as 'solid' | 'dashed',
            })
          }
        >
          <option value="solid">실선</option>
          <option value="dashed">점선</option>
        </select>
      </label>
    </form>
  );
}

function BlockEditor({ block, onChange }: BlockEditorProps) {
  switch (block.type) {
    case 'text':
      return <TextBlockEditor block={block} onChange={onChange} />;
    case 'image':
      return <ImageBlockEditor block={block} onChange={onChange} />;
    case 'table':
      return <TableBlockEditor block={block} onChange={onChange} />;
    case 'divider':
      return <DividerBlockEditor block={block} onChange={onChange} />;
    default:
      return (
        <div className="editor-placeholder">
          선택한 블록은 편집할 수 없습니다.
        </div>
      );
  }
}

export function EditorPanel({
  document,
  selected,
  onSelect,
  onBlockChange,
  overflowPages,
}: EditorPanelProps) {
  const activeBlock = useMemo(() => {
    if (!selected) return null;
    const page = document.pages.find((item) => item.id === selected.pageId);
    return page?.blocks.find((item) => item.id === selected.blockId) ?? null;
  }, [document, selected]);

  return (
    <div className="editor-panel">
      <h2>블록 목록</h2>
      <BlockList
        document={document}
        selected={selected}
        onSelect={onSelect}
        overflowPages={overflowPages}
      />
      <div className="editor-divider" />
      <h2>속성 편집</h2>
      {activeBlock ? (
        <BlockEditor
          block={activeBlock}
          onChange={(next) => {
            if (!selected) return;
            onBlockChange(selected.pageId, next);
          }}
        />
      ) : (
        <div className="editor-placeholder">편집할 블록을 선택하세요.</div>
      )}
    </div>
  );
}

export type { SelectedBlock };
