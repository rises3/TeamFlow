export interface Project {
  id: number;
  name: string;
  description: string;
  ownerId: number;
  status: 'active' | 'archived';
  startDate: string; // ISO, pl. "2026-11-16"
  dueDate: string;
}
