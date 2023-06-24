export interface Annotation {
  source: string;
  level: string;
  filePath: string;
  line: number | null;
  kind: string | null;
  message: string;
}
