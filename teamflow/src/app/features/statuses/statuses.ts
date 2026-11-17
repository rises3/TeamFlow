export interface Status {
  id: number;
  name: string;
  key: string; // egyedi technikai név, pl. todo / doing / done
  color: string; // #RRGGBB
  order: number;
}
