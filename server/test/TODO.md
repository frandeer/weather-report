# 기상청 PDF 다운로드 기능의 기술 스택 분석 및 구현 가이드첨부하신 기상 가뭄 예보 PDF는 웹에서 조회도 가능하고 PDF로 다운로드도 되는 전형적인 정부기관 리포트 시스템입니다. 이러한 시스템이 어떤 기술로 만들어졌는지, 그리고 React/Next.js/Spring Boot 환경에서 어떻게 구현할 수 있는지 상세히 분석해드리겠습니다.

## 기상청 PDF 생성 기술 추정첨부하신 PDF 문서의 특징을 분석하면 다음과 같습니다:[1]
- **정형화된 표 구조**: 지역별 가뭄 현황을 표 형식으로 정리
- **한글 완벽 지원**: 모든 텍스트가 깨짐 없이 렌더링
- **지도 이미지 포함**: 가뭄 분포도 시각화
- **일관된 포맷팅**: 헤더, 본문, 표가 체계적으로 구성

이러한 특징으로 볼 때, 기상청은 다음 방식 중 하나를 사용했을 가능성이 높습니다:

### 가능성 1: 서버 사이드 템플릿 + PDF 라이브러리 (가장 높음)정부기관은 안정성이 검증된 기술을 선호하므로, JSP나 Thymeleaf 같은 템플릿 엔진으로 HTML을 생성한 후 **iText**, **Apache PDFBox**, 또는 **Flying Saucer** 같은 Java PDF 라이브러리로 변환했을 가능성이 가장 높습니다.[2][3][4]

### 가능성 2: 헤드리스 브라우저 (중간)복잡한 레이아웃(표, 지도, 차트)을 정확히 재현하기 위해 **Puppeteer**나 **Playwright**를 사용했을 수도 있습니다. 이 방식은 HTML/CSS를 그대로 PDF로 변환하므로 레이아웃 정확도가 매우 높습니다.[5][6][7]## React/Next.js/Spring Boot 환경을 위한 추천 솔루션사용자 환경(React 기반, Next.js, Spring Boot 사용 가능)을 고려하여 4가지 접근법을 비교했습니다:

| 접근법 | 기술 스택 | 난이도 | 한글 지원 | 레이아웃 유연성 | 성능 | 추천 점수 |
|--------|-----------|--------|-----------|----------------|------|-----------|
| **방법 1: Next.js + Puppeteer** (추천) | React → HTML/CSS → Puppeteer → PDF | 중 | ★★★ | ★★★ | ★★☆ | 9/10 |
| 방법 2: React + Spring Boot + iText | React → JSON Data → Spring Boot → iText → PDF | 중상 | ★★★ | ★☆☆ | ★★★ | 7/10 |
| 방법 3: Next.js + @react-pdf/renderer | React → @react-pdf/renderer → PDF | 하 | ★★☆ | ★★☆ | ★★☆ | 6/10 |
| 방법 4: Spring Boot + Flying Saucer | Thymeleaf → XHTML/CSS → Flying Saucer → PDF | 중 | ★★★ | ★★☆ | ★★☆ | 7/10 |### 추천 방법: Next.js + Puppeteer**왜 이 방법을 추천하는가?**
1. **HTML/CSS를 그대로 PDF로 변환**: 기존 React 컴포넌트를 재사용 가능[5][6]
2. **레이아웃 정확도**: 복잡한 표, 차트, 지도를 브라우저 렌더링 그대로 PDF화[8][7]
3. **한글 완벽 지원**: 웹 폰트나 시스템 폰트 사용 가능[9][10]
4. **유지보수 용이**: 웹 페이지와 PDF가 동일한 소스코드 사용[11][12]

## 구체적인 구현 방법### 방법 1: Next.js + Puppeteer (추천)#### 1단계: 의존성 설치
```bash
npm install puppeteer
```

#### 2단계: 리포트 페이지 작성 (pages/report.tsx)
```typescript
export default function Report({ data }) {
  return (
    <div className="report-container">
      <h1>기상 가뭄 예보</h1>
      <table>
        <thead>
          <tr><th>지역</th><th>강수량</th><th>가뭄상태</th></tr>
        </thead>
        <tbody>
          {data.map(item => (
            <tr key={item.id}>
              <td>{item.region}</td>
              <td>{item.rainfall}</td>
              <td>{item.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

#### 3단계: PDF 생성 API (pages/api/generate-pdf.ts)
```typescript
import puppeteer from 'puppeteer';

export default async function handler(req, res) {
  const { reportId } = req.query;
  
  // 브라우저 실행
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  // 리포트 페이지 로드 (동일 서버의 HTML 페이지)
  await page.goto(`http://localhost:3000/report?id=${reportId}`, {
    waitUntil: 'networkidle0'
  });
  
  // PDF 생성
  const pdf = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: { top: '10mm', bottom: '10mm', left: '10mm', right: '10mm' }
  });
  
  await browser.close();
  
  // PDF 반환
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename=report.pdf');
  res.send(pdf);
}
```

이 방식은 Next.js의 API Routes를 활용하여 서버 사이드에서 Puppeteer를 실행합니다.[6][11][12]

### 방법 2: Spring Boot + iText (대안)Spring Boot를 메인 백엔드로 사용하고 싶다면 iText를 활용할 수 있습니다:[3][4][13]

```java
@RestController
@RequestMapping("/api/pdf")
public class PdfController {
    
    @GetMapping("/generate")
    public ResponseEntity<byte[]> generatePdf(@RequestParam String reportId) {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        
        // iText로 PDF 생성
        PdfWriter writer = new PdfWriter(baos);
        PdfDocument pdf = new PdfDocument(writer);
        Document document = new Document(pdf, PageSize.A4);
        
        // 한글 폰트 설정
        PdfFont font = PdfFontFactory.createFont(
            "fonts/NanumGothic.ttf", 
            PdfEncodings.IDENTITY_H
        );
        document.setFont(font);
        
        // 제목 추가
        document.add(new Paragraph("기상 가뭄 예보")
            .setFontSize(20)
            .setBold());
        
        // 표 추가
        Table table = new Table(3);
        table.addHeaderCell("지역");
        table.addHeaderCell("강수량");
        table.addHeaderCell("가뭄상태");
        
        // 데이터 추가
        List<WeatherData> data = weatherService.getData(reportId);
        for (WeatherData item : data) {
            table.addCell(item.getRegion());
            table.addCell(item.getRainfall());
            table.addCell(item.getStatus());
        }
        
        document.add(table);
        document.close();
        
        // PDF 반환
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "report.pdf");
        
        return ResponseEntity.ok()
            .headers(headers)
            .body(baos.toByteArray());
    }
}
```

## 주요 기술 비교### Puppeteer vs Playwright두 라이브러리는 매우 유사하지만 몇 가지 차이점이 있습니다:[7][14][15]

**Puppeteer (Google)**[5][8][7]
- Chrome/Chromium에 특화
- 더 큰 커뮤니티 (80,000+ GitHub stars)
- Node.js/TypeScript만 지원
- 안정성 검증됨

**Playwright (Microsoft)**[14][16][7]
- 다중 브라우저 지원 (Chrome, Firefox, WebKit)
- Python, Java, C# 지원
- 더 나은 성능 최적화
- 신기술 (2020년 출시)

**PDF 생성 관점에서는 Puppeteer를 추천합니다**. Chromium 기반으로 충분하며, 커뮤니티가 더 크고 검증된 솔루션이기 때문입니다.[15][7]

### 한글 지원 비교PDF 생성 시 한글 지원은 매우 중요합니다. 각 라이브러리의 한글 지원 수준은 다음과 같습니다:[10][17]

**우수 (★★★)**
- Puppeteer/Playwright: 웹 폰트 사용으로 완벽 지원[9][5]
- iText: TTF 폰트 임베딩으로 완벽 지원[2][3]
- Flying Saucer: XHTML+CSS로 한글 완벽 렌더링[4]

**보통 (★★☆)**
- @react-pdf/renderer: 한글 폰트 설정 필요하며 일부 제약[18][19]
- jsPDF: TTF 변환 과정 필요[20][21]

## 실전 구현 체크리스트### Puppeteer 사용 시 주의사항1. **메모리 관리**: 브라우저 인스턴스를 반드시 닫아야 합니다[8][22]
```typescript
try {
  const browser = await puppeteer.launch();
  // ... PDF 생성
} finally {
  await browser.close(); // 필수!
}
```

2. **동시성 제어**: 동시 요청을 5-10개로 제한하세요[23][8]
```typescript
const queue = new PQueue({ concurrency: 5 });
```

3. **Docker 환경**: `--no-sandbox` 플래그가 필요합니다[5][22]
```dockerfile
FROM node:18
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-nanum
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
```

4. **타임아웃 설정**: `networkidle0` 대신 명시적 대기를 권장합니다[24][23]
```typescript
await page.goto(url, { waitUntil: 'domcontentloaded' });
await page.waitForSelector('.report-container', { timeout: 5000 });
```

### iText 사용 시 주의사항1. **라이선스**: AGPL 라이선스이므로 상용 서비스는 유료 라이선스 구매가 필요합니다[2][3]

2. **한글 폰트 임베딩**: TTF 파일을 프로젝트에 포함해야 합니다[3][2]
```java
PdfFont font = PdfFontFactory.createFont(
    "fonts/NanumGothic.ttf", 
    PdfEncodings.IDENTITY_H
);
```

3. **표 생성의 복잡성**: 프로그래밍 방식으로 표를 만들어야 하므로 HTML보다 복잡합니다[4][2]

## 성능 최적화 전략### 1. 브라우저 인스턴스 재사용 (Puppeteer)[8][25]```typescript
let browser: Browser | null = null;

async function getBrowser() {
  if (!browser) {
    browser = await puppeteer.launch();
  }
  return browser;
}
```

### 2. 캐싱 전략[8]동일한 데이터라면 PDF를 캐싱하여 재사용:
```typescript
const cacheKey = `pdf:${reportId}:${lastModified}`;
const cached = await redis.get(cacheKey);
if (cached) return cached;
```

### 3. 비동기 처리[8][23]대용량 요청은 큐 시스템으로 처리:
```typescript
import Bull from 'bull';
const pdfQueue = new Bull('pdf-generation');
```

### 4. 프리뷰 생성[26][27]전체 PDF 대신 첫 페이지 이미지를 미리 생성:
```typescript
await page.screenshot({ path: 'preview.png' });
```

## 보안 고려사항1. **XSS 방지**: 사용자 입력을 검증하세요[28][22]
2. **Path Traversal 방지**: 파일명을 sanitize하세요[28]
3. **접근 권한**: PDF 생성 전 사용자 권한을 확인하세요[29]
4. **리소스 제한**: 악의적인 대용량 요청을 방지하세요[8][23]

## 결론 및 추천사항기상청과 같은 정부기관 스타일의 PDF 리포트를 React/Next.js/Spring Boot 환경에서 구현하려면 **Next.js + Puppeteer 조합**을 강력히 추천합니다. 이 방식은:

1. ✅ **HTML/CSS 재사용**: 웹 페이지와 PDF가 동일한 디자인
2. ✅ **복잡한 레이아웃 완벽 재현**: 표, 차트, 지도 등 모두 지원
3. ✅ **한글 완벽 지원**: 웹 폰트 그대로 사용
4. ✅ **유지보수 용이**: React 컴포넌트만 수정하면 됨

대안으로 Spring Boot를 메인 백엔드로 사용해야 한다면 **iText**를 선택하세요. 다만 레이아웃을 코드로 구성해야 하므로 초기 개발 시간이 더 걸립니다.

첨부하신 기상청 PDF와 같은 수준의 문서를 만들기 위해서는 위의 구현 체크리스트를 참고하여 단계별로 진행하시면 됩니다.

[1](https://www.weather.go.kr/w/repositary/xml/fct/mon/drought_mon1_fcst_kma_down_20251016.pdf)
[2](https://www.dreamsecurity.com/product/PDF/itext)
[3](https://multigenesys.com/blog/advanced-pdf-generation-with-java-spring-boot-and-itext-a-comprehensive-guide)
[4](https://pdforge.com/blog/top-java-libraries-for-pdf-generation-in-2025)
[5](https://pdforge.com/blog/how-to-convert-html-to-pdf-using-nodejs-3-best-libraries-in-2025)
[6](https://stackoverflow.com/questions/70931969/how-can-i-export-a-nextjs-page-as-pdf)
[7](https://www.browserstack.com/guide/playwright-vs-puppeteer)
[8](https://www.linkedin.com/pulse/comparison-pdf-%D1%81reation-options-from-seasoned-developer-0jgvf)
[9](https://pdfgeneratorapi.com/blog/3-ways-to-generate-pdf-from-html-with-javascript)
[10](https://velog.io/@autorag/PDF-%ED%95%9C%EA%B8%80-%ED%85%8D%EC%8A%A4%ED%8A%B8-%EC%B6%94%EC%B6%9C-%EC%8B%A4%ED%97%98)
[11](https://dev.to/wonder2210/generating-pdf-files-using-next-js-24dm)
[12](https://github.com/stanleyfok/nextjs-pdf)
[13](https://github.com/loizenai/spring-boot-itext-pdf-generation-example)
[14](https://www.browsercat.com/post/playwright-vs-puppeteer-web-scraping-comparison)
[15](https://scrapingant.com/blog/playwright-vs-puppeteer)
[16](https://autify.com/blog/playwright-vs-puppeteer)
[17](https://mz-moonzoo.tistory.com/73)
[18](https://npm-compare.com/html2pdf.js,jspdf,react-pdf,react-to-pdf)
[19](https://themeselection.com/react-pdf-library-and-viewers/)
[20](https://www.quickpdflibrary.com/faq/draw-text-with-korean-font-onto-pdf.php)
[21](https://dev.to/handdot/generate-a-pdf-in-js-summary-and-comparison-of-libraries-3k0p)
[22](https://www.penta-code.com/server-side-render-spas-with-puppeteer/)
[23](https://stackoverflow.com/questions/56794245/server-side-render-javascript-app-with-puppeteer/56794246)
[24](https://community.latenode.com/t/server-side-rendering-of-a-javascript-application-with-puppeteer/5839)
[25](https://harrisonpim.com/blog/creating-a-downloadable-pdf-copy-of-a-page-using-next-js-and-puppeteer)
[26](https://www.ni.com/docs/en-US/bundle/teststand/page/generating-pdf-reports.html)
[27](https://research.aimultiple.com/playwright-vs-puppeteer/)
[28](https://www.intigriti.com/researchers/blog/hacking-tools/exploiting-pdf-generators-a-complete-guide-to-finding-ssrf-vulnerabilities-in-pdf-generators)
[29](https://www.gov.kr/portal/govEng)
[30](https://www.weather.go.kr/w/repo)
[31](https://stackoverflow.com/questions/1980890/pdf-report-generation)
[32](https://www.nutrient.io/blog/top-ten-ways-to-convert-html-to-pdf/)
[33](https://stackoverflow.com/questions/9426983/creating-pdfs-using-tcpdf-that-supports-all-languages-especially-cjk)
[34](https://dl.acm.org/doi/pdf/10.1145/3691352)
[35](https://www.foxit.com/solution/government/)
[36](https://stackoverflow.com/questions/27875008/html-to-pdf-conversion-at-server-side)
[37](https://github.com/AdirthaBorgohain/reportAI)
[38](https://blog.logrocket.com/best-html-pdf-libraries-node-js/)
[39](https://smallpdf.com/translate-pdf/korean-to-english)
[40](https://knowledge.ni.com/KnowledgeArticleDetails?id=kA00Z000000kGF9SAM)
[41](https://dev.to/christianca/what-tools-do-you-use-for-server-side-pdf-generation-31mb)
[42](https://github.com/shahrukhx01/multilingual-pdf2text)
[43](https://www.thatsoftwaredude.com/content/14087/top-javascript-pdf-libraries)
[44](https://www.reddit.com/r/nextjs/comments/1clummb/generating_pdfs_on_the_server_side/)
[45](https://www.youtube.com/watch?v=S7udzd3xjGQ)
[46](https://github.com/Paras2322/SpringBoot-PDF)
[47](https://dev.to/tayyabcodes/heres-3-popular-java-pdf-libraries-fhf)
[48](https://blog.logrocket.com/generating-pdfs-react/)
[49](https://stackoverflow.com/questions/60306060/generating-pdf-in-next-js)
[50](https://www.reddit.com/r/reactjs/comments/zaf578/best_library_for_showing_a_pdf_in_react/)
[51](https://www.nutrient.io/guides/web/pdf-generation/nextjs/)
[52](https://www.foxit.kr)
[53](https://funpacifico.cl/wp-content/uploads/2021/05/Gobierno-Digital-PPT_Sr.-Son.pdf)
[54](https://blog.csdn.net/cumian8165/article/details/108155360)
[55](https://www.nl.go.kr/EN/contents/EN50500000000.do)
[56](https://testgrid.io/blog/playwright-vs-puppeteer/)
[57](https://koreascience.kr/article/JAKO202112054772876.page)
[58](https://github.com/Tommos0/puppeteer-ssr)
[59](https://www.jccr.re.kr/xml/35226/35226.pdf)
[60](https://community.latenode.com/t/using-puppeteer-to-render-a-react-component/2667)
[61](https://oxylabs.io/blog/playwright-vs-puppeteer)
[62](https://www.renewable-ei.org/pdfdownload/activities/REI_SKoreaReport_202311_EN.pdf)