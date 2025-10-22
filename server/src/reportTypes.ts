export type TextStyle = {
  align?: 'left' | 'center' | 'right' | 'justify';
  weight?: 'normal' | 'bold';
  size?: number;
  lineHeight?: number;
};

export type ImageLayout = {
  width?: string;
  align?: 'left' | 'center' | 'right';
};

export type TableColumn = {
  key: string;
  header: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
};

export type TableRow = Record<string, string | number>;

export type HeaderFooterConfig = {
  left?: string;
  center?: string;
  right?: string;
};

export type ReportBlock =
  | { type: 'text'; id: string; content: string; style?: TextStyle }
  | { type: 'image'; id: string; src: string; caption?: string; layout?: ImageLayout }
  | { type: 'table'; id: string; columns: TableColumn[]; rows: TableRow[]; caption?: string }
  | { type: 'divider'; id: string; variant?: 'solid' | 'dashed' }
  | { type: 'pageBreak'; id: string };

export type ReportPage = {
  id: string;
  blocks: ReportBlock[];
  header?: HeaderFooterConfig;
  footer?: HeaderFooterConfig;
};

export type ReportDocument = {
  id: string;
  title: string;
  pages: ReportPage[];
  metadata?: Record<string, unknown>;
  createdAt: string;
};
