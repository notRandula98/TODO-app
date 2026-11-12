export type Status = 'TODO' | 'IN_PROGRESS' | 'DONE';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: Status;
  dueDate?: string;
  createdAt: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  status?: Status;
  dueDate?: string;
}

export type UpdateTaskInput = Partial<CreateTaskInput>;

export interface TaskPage {
  data: Task[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const TASKS_KEY = '/api/tasks';

async function request<T>(path = '', options?: RequestInit): Promise<T> {
  const response = await fetch(`${TASKS_KEY}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(Array.isArray(body.message)
      ? body.message.join('. ')
      : body.message || 'Something went wrong. Please try again.');
  }
  return response.status === 204 ? undefined as T : response.json();
}

export const tasksService = {
  listPage(page = 1, limit = 100): Promise<TaskPage> {
    return request(`?limit=${limit}&page=${page}`);
  },
  async list(): Promise<Task[]> {
    const first = await tasksService.listPage();
    const pages = await Promise.all(Array.from(
      { length: Math.max(0, first.totalPages - 1) },
      (_, index) => tasksService.listPage(index + 2),
    ));
    return [...first.data, ...pages.flatMap(page => page.data)];
  },
  get(id: string): Promise<Task> {
    return request(`/${encodeURIComponent(id)}`);
  },
  create(input: CreateTaskInput): Promise<Task> {
    return request('', { method: 'POST', body: JSON.stringify(input) });
  },
  update(id: string, input: UpdateTaskInput): Promise<Task> {
    return request(`/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(input) });
  },
  remove(id: string): Promise<void> {
    return request(`/${encodeURIComponent(id)}`, { method: 'DELETE' });
  },
};
