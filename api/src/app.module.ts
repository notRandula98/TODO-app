import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { resolve } from 'node:path';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { TasksController } from './tasks/tasks.controller.js';
import { TasksService } from './tasks/tasks.service.js';
import { TaskEntity } from './tasks/task.entity.js';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: resolve(process.env.DATABASE_PATH ?? 'todo.db'),
      entities: [TaskEntity],
      synchronize:
        process.env.DB_SYNCHRONIZE === undefined
          ? process.env.NODE_ENV !== 'production'
          : process.env.DB_SYNCHRONIZE === 'true',
    }),
    TypeOrmModule.forFeature([TaskEntity]),
  ],
  controllers: [AppController, TasksController],
  providers: [AppService, TasksService],
})
export class AppModule {}
