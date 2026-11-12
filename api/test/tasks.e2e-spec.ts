import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { createTestApp } from './create-test-app.js';

describe('Tasks API', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    app = await createTestApp();
  });

  afterEach(async () => {
    await app.close();
  });

  it('creates, lists, reads, updates, and deletes a task', async () => {
    const server = app.getHttpServer();
    await request(server).get('/tasks').expect(200, {
      data: [],
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
    });
    const created = await request(server)
      .post('/tasks')
      .send({ title: 'Write API' })
      .expect(201);
    const task = created.body;
    expect(task).toMatchObject({
      title: 'Write API',
      status: 'TODO',
      id: expect.any(String),
      createdAt: expect.any(String),
    });
    expect(Number.isNaN(Date.parse(task.createdAt))).toBe(false);
    await request(server).get(`/tasks/${task.id}`).expect(200, task);
    await request(server)
      .get('/tasks')
      .expect(200, {
        data: [task],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    await request(server)
      .patch(`/tasks/${task.id}`)
      .send({
        status: 'IN_PROGRESS',
        description: 'Implement routes',
        dueDate: '2026-12-01',
      })
      .expect(200);
    const updated = await request(server)
      .patch(`/tasks/${task.id}`)
      .send({ status: 'DONE' })
      .expect(200);
    expect(updated.body).toMatchObject({
      ...task,
      status: 'DONE',
      description: 'Implement routes',
      dueDate: '2026-12-01',
    });
    await request(server).delete(`/tasks/${task.id}`).expect(204);
    await request(server).get(`/tasks/${task.id}`).expect(404);
  });

  it.each([
    {},
    { title: '' },
    { title: '   ' },
    { title: 42 },
    { title: null },
    { title: 'Task', status: 'INVALID' },
    { title: 'Task', status: null },
    { title: 'Task', description: 4 },
    { title: 'Task', dueDate: '2026-02-30' },
    { title: 'Task', dueDate: null },
    { title: 'Task', id: 'custom' },
  ])('rejects invalid creation: %j', async (body) => {
    await request(app.getHttpServer()).post('/tasks').send(body).expect(400);
  });

  it.each([
    { title: '' },
    { title: null },
    { status: 'INVALID' },
    { status: null },
    { description: 42 },
    { dueDate: 'invalid' },
    { createdAt: '2026-01-01' },
  ])('rejects invalid updates: %j', async (body) => {
    const server = app.getHttpServer();
    const created = await request(server)
      .post('/tasks')
      .send({ title: 'Task' })
      .expect(201);
    await request(server)
      .patch(`/tasks/${created.body.id}`)
      .send(body)
      .expect(400);
    await request(server)
      .get(`/tasks/${created.body.id}`)
      .expect(200, created.body);
  });

  it('returns 404 for reads, updates, and deletes of absent tasks', async () => {
    const server = app.getHttpServer();
    await request(server).get('/tasks/missing').expect(404);
    await request(server)
      .patch('/tasks/missing')
      .send({ title: 'Task' })
      .expect(404);
    await request(server).delete('/tasks/missing').expect(404);
  });

  it('combines filters, sorts due dates, and counts matches before pagination', async () => {
    const server = app.getHttpServer();
    for (const task of [
      { title: 'Late', status: 'TODO', dueDate: '2026-12-02' },
      { title: 'No date', status: 'TODO' },
      { title: 'Morning', status: 'TODO', dueDate: '2026-12-01T08:00:00Z' },
      { title: 'Evening', status: 'TODO', dueDate: '2026-12-01T18:00:00Z' },
      { title: 'Done', status: 'DONE', dueDate: '2026-12-01' },
    ]) {
      await request(server).post('/tasks').send(task).expect(201);
    }
    const query = {
      status: 'TODO',
      dueDate: '2026-12-01',
      sortBy: 'dueDate',
      limit: 1,
    };
    const first = await request(server).get('/tasks').query(query).expect(200);
    expect(first.body).toMatchObject({
      data: [{ title: 'Morning' }],
      total: 2,
      page: 1,
      limit: 1,
      totalPages: 2,
    });
    const second = await request(server)
      .get('/tasks')
      .query({ ...query, page: 2 })
      .expect(200);
    expect(
      second.body.data.map((task: { title: string }) => task.title),
    ).toEqual(['Evening']);
    const empty = await request(server)
      .get('/tasks')
      .query({ ...query, page: 3 })
      .expect(200);
    expect(empty.body).toMatchObject({
      data: [],
      total: 2,
      page: 3,
      totalPages: 2,
    });

    for (const [sortOrder, titles] of [
      ['asc', ['Morning', 'Evening', 'Late', 'No date']],
      ['desc', ['Late', 'Evening', 'Morning', 'No date']],
    ] as const) {
      const result = await request(server)
        .get('/tasks')
        .query({ status: 'TODO', sortBy: 'dueDate', sortOrder })
        .expect(200);
      expect(
        result.body.data.map((task: { title: string }) => task.title),
      ).toEqual(titles);
      expect(result.body.total).toBe(4);
    }
    const done = await request(server)
      .get('/tasks')
      .query({ status: 'DONE' })
      .expect(200);
    expect(done.body).toMatchObject({ data: [{ title: 'Done' }], total: 1 });
    const noMatches = await request(server)
      .get('/tasks')
      .query({ dueDate: '2027-01-01' })
      .expect(200);
    expect(noMatches.body).toMatchObject({ data: [], total: 0, totalPages: 0 });
  });

  it.each([
    'page=0',
    'page=-1',
    'page=1.5',
    'page=abc',
    'page=1000001',
    'limit=0',
    'limit=101',
    'limit=1.5',
    'limit=',
    'status=INVALID',
    'status=TODO&status=DONE',
    'dueDate=2026-02-30',
    'dueDate=invalid',
    'dueDate=2026-12-01T00:00:00Z',
    'sortBy=title',
    'sortOrder=invalid',
    'unexpected=value',
  ])('rejects invalid list query: %s', async (query) => {
    await request(app.getHttpServer()).get(`/tasks?${query}`).expect(400);
  });
});
