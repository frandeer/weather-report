import type { ReportDocument } from './reportTypes';

export const sampleReport: ReportDocument = {
  id: 'sample-20241022',
  title: '2024년 10월 기상 리포트 샘플',
  createdAt: '2024-10-22T00:00:00+09:00',
  metadata: {
    author: '기상 리포트 시스템',
    region: '전국',
  },
  pages: [
    {
      id: 'page-1',
      blocks: [
        {
          type: 'text',
          id: 'intro-title',
          content: '□ (개요) 2024년 10월 셋째 주 기상 리포트',
          style: { size: 14, weight: 'bold' },
        },
        {
          type: 'text',
          id: 'intro-body',
          content:
            '○ 전국적으로 기온이 평년 대비 1~2℃ 낮았으며, 강원영동과 경상권을 중심으로 강수량이 증가했습니다.',
          style: { size: 11, lineHeight: 1.6 },
        },
        {
          type: 'image',
          id: 'main-map',
          src: 'https://www.weather.go.kr/w/resources/images/common/content/sample_map.png',
          caption: '그림 1. 10월 셋째 주 강수 분포도',
          layout: { width: '80%', align: 'center' },
        },
        {
          type: 'table',
          id: 'summary-table',
          caption: '표 1. 권역별 요약 지표',
          columns: [
            { key: 'region', header: '권역', width: '25%' },
            { key: 'temp', header: '평균 기온(℃)', align: 'right' },
            { key: 'rain', header: '강수량(mm)', align: 'right' },
            { key: 'status', header: '가뭄 현황', width: '20%' },
          ],
          rows: [
            { region: '수도권', temp: '12.4', rain: '18.7', status: '정상' },
            { region: '강원영동', temp: '9.8', rain: '48.3', status: '다소 촉촉' },
            { region: '충청권', temp: '11.2', rain: '21.5', status: '정상' },
            { region: '호남권', temp: '12.9', rain: '17.1', status: '정상' },
            { region: '영남권', temp: '13.4', rain: '36.2', status: '부분 호전' },
            { region: '제주도', temp: '16.1', rain: '42.4', status: '정상' },
          ],
        },
      ],
    },
    {
      id: 'page-2',
      blocks: [
        {
          type: 'text',
          id: 'analysis-title',
          content: '□ (분석) 권역별 상세 분석',
          style: { size: 13, weight: 'bold' },
        },
        {
          type: 'text',
          id: 'analysis-a',
          content:
            '○ 강원영동: 동풍의 영향으로 강수량이 크게 증가했으며, 산간 지역 중심으로 기온이 급격히 하락했습니다.',
          style: { size: 11, lineHeight: 1.6 },
        },
        {
          type: 'text',
          id: 'analysis-b',
          content:
            '○ 영남권: 남해안을 중심으로 한때 강풍이 관측되었으며, 연안 지역에서의 해상 주의보가 유지되었습니다.',
          style: { size: 11, lineHeight: 1.6 },
        },
        {
          type: 'divider',
          id: 'divider-1',
          variant: 'dashed',
        },
        {
          type: 'text',
          id: 'analysis-table-title',
          content: '○ 주요 관측 지점 데이터',
          style: { size: 12, weight: 'bold' },
        },
        {
          type: 'table',
          id: 'station-table',
          columns: [
            { key: 'station', header: '관측소' },
            { key: 'temp', header: '최고/최저 기온(℃)', align: 'center' },
            { key: 'rain', header: '일강수량(mm)', align: 'right' },
            { key: 'wind', header: '최대풍속(m/s)', align: 'right' },
          ],
          rows: [
            { station: '속초', temp: '15.2 / 6.3', rain: '28.6', wind: '13.4' },
            { station: '강릉', temp: '16.1 / 7.2', rain: '42.1', wind: '15.2' },
            { station: '부산', temp: '19.2 / 12.4', rain: '31.8', wind: '12.7' },
            { station: '제주', temp: '21.5 / 15.8', rain: '25.4', wind: '10.9' },
          ],
        },
      ],
    },
    {
      id: 'page-3',
      blocks: [
        {
          type: 'text',
          id: 'outlook-title',
          content: '□ (전망) 향후 1주일 전망',
          style: { size: 13, weight: 'bold' },
        },
        {
          type: 'text',
          id: 'outlook-a',
          content:
            '○ 10월 4주차에는 북서쪽에서 차가운 공기가 남하하면서 기온이 평년보다 1~3℃ 낮을 것으로 예상됩니다.',
          style: { size: 11, lineHeight: 1.6 },
        },
        {
          type: 'text',
          id: 'outlook-b',
          content:
            '○ 비는 주로 동해안을 중심으로 예상되며, 서해안 지역은 고기압의 영향으로 맑은 날이 많겠습니다.',
          style: { size: 11, lineHeight: 1.6 },
        },
        {
          type: 'image',
          id: 'chart-trend',
          src: 'https://dummyimage.com/800x400/1f77b4/ffffff.png&text=Temperature+Trend',
          caption: '그림 2. 주요 권역 온도 추세(예측)',
          layout: { width: '85%', align: 'center' },
        },
        {
          type: 'text',
          id: 'outlook-footer',
          content:
            '* 본 리포트는 기상청 예보 데이터를 기반으로 작성되었으며, 실제 상황과 다를 수 있습니다.',
          style: { size: 10, align: 'right', lineHeight: 1.4 },
        },
      ],
    },
  ],
};
