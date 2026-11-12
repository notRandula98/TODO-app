import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import type { App } from 'supertest/types.js';
import { AppModule } from '../src/app.module.js';
import { TaskEntity } from '../src/tasks/task.entity.js';

export async function createTestApp(
  database = ':memory:',
): Promise<INestApplication<App>> {
  const module = await Test.createTestingModule({ imports: [AppModule] })
    .overrideProvider(DataSource)
    .useFactory({
      factory: () =>
        new DataSource({
          type: 'better-sqlite3',
          database,
          entities: [TaskEntity],
          synchronize: true,
        }).initialize(),
    })
    .compile();
  const app = module.createNestApplication<INestApplication<App>>();
  await app.init();
  return app;
}
