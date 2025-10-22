# Weather Report PDF Generator

React와 Puppeteer를 활용한 A4 규격 기상 리포트 작성 및 PDF 생성 시스템입니다.

## 📋 프로젝트 개요

웹 기반 리포트 저작/미리보기 도구로, React 페이지에서 텍스트, 이미지, 표 등의 요소를 조합하여 A4 규격의 기상 리포트를 작성하고, Puppeteer를 통해 고품질 PDF로 생성할 수 있습니다.

### 주요 기능

- ✏️ **웹 기반 리포트 편집**: 텍스트, 이미지, 표 블록을 조합하여 리포트 작성
- 📄 **A4 페이지 레이아웃**: 고정 높이(210mm × 297mm) 영역으로 페이지 구분
- 🎨 **실시간 미리보기**: 편집 내용을 즉시 확인
- ⚠️ **레이아웃 검증**: 페이지 오버플로우 자동 감지 및 경고
- 📥 **PDF 다운로드**: Puppeteer 기반 고품질 PDF 생성 및 다운로드
- 🔧 **블록 편집**: 각 블록의 속성(스타일, 정렬, 내용) 수정 가능

## 🏗️ 시스템 구조

```
┌────────────────────────┐          HTTP/REST          ┌────────────────────┐
│  React Frontend        │ ───────────────────────────▶│  Node.js Server    │
│  (Vite + TypeScript)   │                              │  (Express +        │
│  - ReportRenderer      │ ◀─────────────────────────── │   Puppeteer)       │
│  - EditorPanel         │       PDF Binary             └────────────────────┘
└────────────────────────┘
```

## 🛠️ 기술 스택

### Frontend
- **React** 19.1.1
- **TypeScript** 5.9.3
- **Vite** 7.1.7
- **CSS Modules**

### Backend
- **Node.js** (TypeScript)
- **Express** 4.21.1
- **Puppeteer** 23.7.1
- **tsx** (개발용 TypeScript 실행)

## 📦 설치 방법

### 사전 요구사항
- Node.js 18 이상
- npm 또는 pnpm

### 1. 저장소 클론
```bash
git clone <repository-url>
cd weather-report
```

### 2. 프론트엔드 설치
```bash
cd frontend
npm install
```

### 3. 백엔드 설치
```bash
cd ../server
npm install
```

## 🚀 실행 방법

### 개발 모드

#### 1. 백엔드 서버 실행
```bash
cd server
npm run dev
```
서버가 `http://localhost:4000`에서 실행됩니다.

#### 2. 프론트엔드 실행
```bash
cd frontend
npm run dev
```
프론트엔드가 `http://localhost:5173`에서 실행됩니다.

### 프로덕션 빌드

#### 프론트엔드 빌드
```bash
cd frontend
npm run build
```

#### 서버 실행
```bash
cd server
npm start
```

## 📂 프로젝트 구조

```
weather-report/
├── docs/
│   └── architecture-plan.md       # 시스템 설계 문서
├── frontend/                      # React 프론트엔드
│   ├── src/
│   │   ├── report/
│   │   │   ├── components/
│   │   │   │   ├── EditorPanel.tsx     # 블록 편집 패널
│   │   │   │   ├── ReportRenderer.tsx  # 리포트 렌더러
│   │   │   │   └── report.css
│   │   │   ├── sampleReport.ts         # 샘플 데이터
│   │   │   └── types.ts                # 타입 정의
│   │   ├── App.tsx                     # 메인 앱 컴포넌트
│   │   └── main.tsx
│   └── package.json
├── server/                        # Node.js 백엔드
│   ├── src/
│   │   ├── app.ts                 # Express 서버 메인
│   │   ├── reportHtml.ts          # HTML 렌더링
│   │   ├── reportTypes.ts         # 타입 정의
│   │   └── sampleReport.ts        # 샘플 데이터
│   └── package.json
└── README.md
```

## 📡 API 엔드포인트

### `POST /api/pdf`
리포트 데이터를 받아 PDF 파일을 생성합니다.

**요청 본문:**
```json
{
  "document": {
    "id": "report-id",
    "title": "리포트 제목",
    "pages": [...],
    "createdAt": "2025-10-22T00:00:00.000Z"
  }
}
```

**응답:**
- Content-Type: `application/pdf`
- PDF 바이너리 데이터

### `POST /api/html`
리포트 데이터를 받아 렌더링된 HTML을 반환합니다.

**응답:**
- Content-Type: `text/html`
- 렌더링된 HTML 문자열

### `GET /health`
서버 상태를 확인합니다.

**응답:**
```json
{
  "status": "ok",
  "timestamp": "2025-10-22T00:00:00.000Z"
}
```

## 🎨 데이터 모델

### ReportDocument
```typescript
type ReportDocument = {
  id: string;
  title: string;
  pages: ReportPage[];
  metadata?: Record<string, unknown>;
  createdAt: string;
};
```

### ReportPage
```typescript
type ReportPage = {
  id: string;
  blocks: ReportBlock[];
  header?: HeaderFooterConfig;
  footer?: HeaderFooterConfig;
};
```

### ReportBlock
```typescript
type ReportBlock =
  | { type: 'text'; id: string; content: string; style?: TextStyle }
  | { type: 'image'; id: string; src: string; caption?: string; layout?: ImageLayout }
  | { type: 'table'; id: string; columns: TableColumn[]; rows: TableRow[]; caption?: string }
  | { type: 'divider'; id: string; variant?: 'solid' | 'dashed' }
  | { type: 'pageBreak'; id: string };
```

## 🔧 환경 변수

### Frontend
`.env` 파일을 생성하여 설정:
```env
VITE_PDF_ENDPOINT=http://localhost:4000/api/pdf
```

### Backend
```env
PORT=4000
```

## ⚠️ 주의사항

1. **폰트 설정**: Puppeteer 환경에 한글 폰트(나눔고딕 등)가 설치되어 있어야 합니다.
2. **페이지 오버플로우**: 각 페이지는 A4 높이를 초과할 수 없습니다. 오버플로우 발생 시 PDF 생성이 차단됩니다.
3. **메모리 관리**: Puppeteer는 상당한 메모리를 사용하므로 서버 리소스를 고려해야 합니다.
4. **보안**: 외부 URL 이미지 로딩 시 SSRF 위험이 있으므로 프로덕션 환경에서는 화이트리스트 설정을 권장합니다.

## 🛣️ 향후 계획

- [ ] 데이터베이스 연동 (리포트 저장/불러오기)
- [ ] 드래그 앤 드롭 블록 재배치
- [ ] 리치텍스트 에디터 (Quill/Tiptap) 통합
- [ ] 사용자 인증 및 권한 관리
- [ ] 템플릿 버전 관리
- [ ] 이미지 업로드 기능
- [ ] 다국어 지원

## 📝 라이선스

이 프로젝트는 공개 프로젝트입니다.

## 👥 기여

버그 리포트나 기능 제안은 이슈를 통해 제출해주세요.
