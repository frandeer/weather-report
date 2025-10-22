# React + Puppeteer 리포트 PDF 시스템 설계 초안

## 목표 요약
- **웹 기반 리포트 저작/미리보기 도구**: React 페이지에서 텍스트, 이미지, 표 요소를 조합해 A4 규격 리포트를 작성.
- **페이지 단위 구성**: 각 페이지는 고정 높이(A4) 영역으로 구분하며, 섹션은 페이지를 넘어갈 때 자동 페이지 분할 또는 수동 분할을 지원.
- **PDF 생성 파이프라인**: Puppeteer를 사용해 완성된 리포트 페이지를 Headless Chrome으로 렌더링하고, 동일 레이아웃을 PDF로 추출.
- **데이터 주입**: 초기에는 정적/샘플 데이터를 사용하되, REST API/DB 연동이 가능하도록 인터페이스 설계.
- **PDF 보기/수정/다운로드**: 웹 내에서 리포트 프리뷰, 편집 인터랙션, PDF 다운로드 버튼 제공.

## 시스템 구성도
```
┌──────────┐    보고서 스키마/데이터    ┌────────────────┐
│  DB/API  │ ─────────────────────────▶ │  Node 서버(PDF) │
└──────────┘                            │  Express +      │
                                        │  Puppeteer      │
                                        └─────▲──────────┘
                                              │
                                              │HTTP 주문(POST)
┌────────────────────────┐              ┌─────┴──────────┐
│ React 프론트엔드(Vite) │ ◀──────────▶ │  HTML 렌더 루트 │
│ - ReportEditor         │  렌더용 URL   │ (SSR 페이지)    │
│ - ReportViewer         │              └────────────────┘
│ - DataSourcePanel      │
└────────────────────────┘
```

## 주요 모듈
### 프론트엔드 (React)
1. **ReportLayout**
   - A4 페이지 사이즈(`210mm x 297mm`)를 CSS로 지정.
   - `Page` 컴포넌트는 margin/padding, 배경, header/footer 영역을 포함.
   - `PageBreak` 컴포넌트를 통해 수동 페이지 구분 지원.
2. **섹션 컴포넌트**
   - `TextBlock`: Markdown/리치텍스트를 HTML로 렌더.
   - `ImageBlock`: 업로드 또는 URL 기반 이미지 표시, 크기/정렬 옵션.
   - `TableBlock`: 열 정의 + 데이터 세트를 받아 렌더. colspan/rowspan 지원 위한 데이터 모델링.
   - `MetricSummary`, `BulletList` 등 템플릿화된 블록을 확장 가능하게 설계.
3. **에디터/데이터 패널**
   - Form 기반으로 각 블록의 속성(폰트, 정렬, 색, 데이터) 수정.
   - 드래그-앤-드롭로 섹션 재배치하는 구조는 2차 목표로 두고, 초기에는 리스트 기반 추가/삭제/순서변경 구현.
4. **Preview + PDF 뷰어**
   - React 측에서 현재 리포트 상태를 `<iframe>` 또는 `<PDFViewer>` (예: `react-pdf-viewer`)로 표시.
   - PDF 다운로드는 서버로 POST 후 blob 응답을 받아 브라우저 다운로드 트리거.

### 백엔드 (Node + Puppeteer)
1. **Express 서버**
   - 엔드포인트: `POST /api/pdf` (리포트 JSON + 템플릿 키 입력) → HTML 렌더 URL 생성 → Puppeteer 렌더 → PDF 반환.
   - 엔드포인트: `GET /render/:id` (SSR 페이지) → React 앱에서 공유하는 템플릿을 SSR 또는 CSR로 렌더.
2. **Puppeteer 워커**
   - 옵션: `headless: "new"`, `args: ['--no-sandbox']`.
   - `page.goto()` 시 query/body 데이터를 `page.evaluateOnNewDocument` 또는 `page.setContent`로 주입.
   - PDF 옵션: `format: 'A4'`, `printBackground: true`, `margin` 지정. 페이지 헤더/푸터 템플릿 커스터마이징 검토.
3. **템플릿/데이터 주입 방법**
   - 리포트 구조를 JSON Schema로 정의: 예) `pages: [{ blocks: [{ type: 'text', props: {...}}, ...]}]`.
   - 서버는 JSON을 받아 EJS/Handlebars 없이 React 번들에서 렌더할 수 있도록 SSR 엔트리 분리 or `@remix-run/serve` 비슷한 접근.
   - 초기 버전은 서버가 React 빌드 파일을 서빙하고, Puppeteer가 `/print?id=xxx` 페이지를 열고 `window.reportData`를 통해 데이터 주입.

## 데이터 모델 초안
```ts
type ReportBlock =
  | { type: 'text'; id: string; content: string; style?: TextStyle }
  | { type: 'image'; id: string; src: string; caption?: string; layout?: ImageLayout }
  | { type: 'table'; id: string; columns: TableColumn[]; rows: TableRow[]; caption?: string }
  | { type: 'divider'; id: string; variant?: 'solid' | 'dashed' }
  | { type: 'pageBreak'; id: string };

type ReportPage = {
  id: string;
  blocks: ReportBlock[];
  header?: HeaderFooterConfig;
  footer?: HeaderFooterConfig;
};

type ReportDocument = {
  id: string;
  title: string;
  pages: ReportPage[];
  metadata?: Record<string, unknown>;
  createdAt: string;
};
```

## 작업 단계 개요
1. **프로젝트 구조화**
   - `packages/frontend` (Vite + React + TypeScript)
   - `packages/server` (Express + Puppeteer)
   - 루트 `pnpm` 또는 `npm` 워크스페이스 구성.
2. **리포트 기본 템플릿 구축**
   - A4 레이아웃, 페이지 프레임, 기본 스타일 정의.
   - 데모 데이터로 2~3페이지 보고서 샘플 생성.
3. **편집 UI 구현**
   - 블록 추가/삭제, 텍스트 편집, 이미지 업로드(URL), 테이블 데이터 입력 폼.
   - 변경 사항을 `ReportDocument` 상태로 관리 (예: `zustand` 또는 React Context).
4. **PDF API 연결**
   - 프론트엔드에서 현재 상태를 JSON으로 API에 POST.
   - 서버는 Puppeteer로 `/print` 페이지 렌더 → PDF → 응답.
5. **PDF 뷰어/다운로드 UX**
   - 생성된 PDF를 Blob으로 받아 `<object>`/`<iframe>`에 표시.
   - 다운로드 버튼 제공.
6. **향후 확장 고려**
   - DB 연동: REST API로 리포트 저장/불러오기.
   - 권한 관리, 템플릿 버전 관리.
   - 리치텍스트 편집기(Quill/Tiptap) 도입.

## 리스크 및 대응
- **Puppeteer & 한글 폰트**: 서버 환경에 나눔고딕 등의 폰트 설치 필요. Docker 이미지 사용 시 폰트 설치 스크립트 포함 계획.
- **페이지 분할 정확도**: CSS `break-inside`, `break-after`, `page-break` 속성 사용. 블록별 높이 측정 필요 시 `react-to-print` 참고.
- **대용량 테이블 성능**: 가상 스크롤보단 페이지 분할로 대응, 필요시 서버에서 데이터 paging.
- **보안**: Puppeteer 렌더 시 외부 URL 이미지 로딩으로 인한 SSRF 위험 → 허용 도메인 화이트리스트 또는 Base64 임베딩.

## 페이지 오버플로 제약 대응 방안
- **A4 단일 페이지 수문**: 페이지를 넘어가는 블록(표/텍스트)을 허용하지 않기 위해 각 페이지의 실측 높이를 `ResizeObserver` + `getBoundingClientRect`로 추적하고, 한도를 넘으면 경고/비활성화 처리.
- **표 제한**: 열 수/행 수에 대한 하드 제한을 템플릿에 명시하고, 표 데이터가 제한을 초과하면 추가 입력을 막거나 새 페이지 템플릿을 생성하도록 안내.
- **텍스트 길이 관리**: 크롤링 문구는 요약/문장 수 자르기를 통해 사전 정제하고, 사용자 편집 시 글자 수 카운터 + 자동 폰트 축소 옵션 제공.
- **폰트 스케일링 정책**: 페이지 여백이 남을 때만 폰트 확대, 한도에 근접하면 최소 폰트까지 자동 조정 후에도 공간 초과 시 사용자에게 알림.
- **미리보기 검증**: PDF 생성 전에 클라이언트에서 한 번 더 레이아웃 검증(overflow 체크)을 수행하고, 문제가 해결될 때까지 PDF 다운로드 버튼 비활성화.

---
본 문서는 초기 설계안으로, 다음 단계에서 구현 세부방안 및 작업 우선순위를 확정합니다.
