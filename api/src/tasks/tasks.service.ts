import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaskEntity } from './task.entity.js';
import { CreateTaskDto, UpdateTaskDto } from './task.dto.js';
import { TaskStatus, type Task } from './task.js';
import { TaskQueryDto } from './task-query.dto.js';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(TaskEntity)
    private readonly tasks: Repository<TaskEntity>,
  ) {}

  // Filters and paginates in SQLite rather than loading every task into memory.
  async findAll(query: TaskQueryDto) {
    const { page, limit, status, dueDate, sortBy, sortOrder } = query;
    const builder = this.tasks.createQueryBuilder('task');
    if (status !== undefined) {
      builder.andWhere('task.status = :status', { status });
    }
    if (dueDate !== undefined) {
      builder.andWhere('date(task.dueDate) = :dueDate', { dueDate });
    }
    if (sortBy === 'dueDate') {
      // Undated tasks come last in either direction; parse ISO timestamps chronologically.
      builder.orderBy('task.dueDate IS NULL', 'ASC');
      builder.addOrderBy(
        'julianday(task.dueDate)',
        sortOrder === 'desc' ? 'DESC' : 'ASC',
      );
    } else {
      builder.orderBy('task.createdAt', sortOrder === 'desc' ? 'DESC' : 'ASC');
    }
    builder.addOrderBy('task.id', 'ASC');
    const [tasks, total] = await builder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();
    return {
      data: tasks.map((task) => this.toTask(task)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // Finds a task by ID or throws a 404 error.
  async findOne(id: string): Promise<Task> {
    const task = await this.tasks.findOneBy({ id });
    if (!task) throw new NotFoundException(`Task ${id} not found`);
    return this.toTask(task);
  }

  // Creates a task with a generated ID, timestamp, and default TODO status.
  async create(dto: CreateTaskDto): Promise<Task> {
    const task: Task = {
      description: dto.description,
      dueDate: dto.dueDate,
      id: randomUUID(),
      title: dto.title,
      status: dto.status ?? TaskStatus.TODO,
      createdAt: new Date().toISOString(),
    };
    return this.toTask(await this.tasks.save(task));
  }

  // Updates only the supplied fields of an existing task.
  async update(id: string, dto: UpdateTaskDto): Promise<Task> {
    const task = await this.findOne(id);
    for (const key of ['title', 'description', 'status', 'dueDate'] as const) {
      if (dto[key] !== undefined) Object.assign(task, { [key]: dto[key] });
    }
    return this.toTask(await this.tasks.save(task));
  }

  // Deletes an existing task or throws a 404 error.
  async remove(id: string): Promise<void> {
    const result = await this.tasks.delete(id);
    if (!result.affected) throw new NotFoundException(`Task ${id} not found`);
  }

  private toTask(entity: TaskEntity): Task {
    return {
      id: entity.id,
      title: entity.title,
      status: entity.status,
      createdAt: entity.createdAt,
      ...(entity.description != null
        ? { description: entity.description }
        : {}),
      ...(entity.dueDate != null ? { dueDate: entity.dueDate } : {}),
    };
  }
}
