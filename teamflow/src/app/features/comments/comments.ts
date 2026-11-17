export interface Comment {
  id: number;
  taskId: number;
  userId: number;
  body: string;
  createdAt: string; // UTC ISO időpont
}
