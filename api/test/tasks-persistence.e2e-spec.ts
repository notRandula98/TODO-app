import { mkdtemp, rmdir, unlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import request from 'supertest';
import { createTestApp } from './create-test-app.js';

it('keeps task changes after restarting the application', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'todo-persistence-'));
  const database = join(directory, 'test.db');
  let app: Awaited<ReturnType<typeof createTestApp>> | undefined;
  try {
    app = await createTestApp(database);
    const created = await request(app.getHttpServer())
      .post('/tasks')
      .send({ title: 'Persistent task' })
      .expect(201);
    const updated = await request(app.getHttpServer())
      .patch(`/tasks/${created.body.id}`)
      .send({ status: 'DONE', description: 'Saved to disk' })
      .expect(200);
    await app.close();
    app = undefined;

    app = await createTestApp(database);
    await request(app.getHttpServer())
      .get(`/tasks/${created.body.id}`)
      .expect(200, updated.body);
    await request(app.getHttpServer())
      .delete(`/tasks/${created.body.id}`)
      .expect(204);
    await app.close();
    app = undefined;

    app = await createTestApp(database);
    await request(app.getHttpServer()).get('/tasks').expect(200, {
      data: [],
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
    });
  } finally {
    await app?.close();
    await unlink(database);
    await rmdir(directory);
  }
});
