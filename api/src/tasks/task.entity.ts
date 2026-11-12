import { Column, Entity, PrimaryColumn } from 'typeorm';
import { TaskStatus } from './task.js';

@Entity('tasks')
export class TaskEntity {
  @PrimaryColumn('text')
  id: string;

  @Column('text')
  title: string;

  @Column('text', { nullable: true })
  description: string | null;

  @Column('text', { default: TaskStatus.TODO })
  status: TaskStatus;

  @Column('text', { nullable: true })
  dueDate: string | null;

  @Column('text')
  createdAt: string;
}
