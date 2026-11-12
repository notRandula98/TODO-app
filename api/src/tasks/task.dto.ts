import {
  IsEnum,
  IsISO8601,
  IsString,
  Matches,
  ValidateIf,
} from 'class-validator';
import { TaskStatus } from './task.js';

export class CreateTaskDto {
  @IsString()
  @Matches(/\S/, { message: 'title must not be empty or whitespace' })
  title: string;

  @ValidateIf((_object, value: unknown) => value !== undefined)
  @IsString()
  description?: string;

  @ValidateIf((_object, value: unknown) => value !== undefined)
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @ValidateIf((_object, value: unknown) => value !== undefined)
  @IsISO8601({ strict: true })
  dueDate?: string;
}

export class UpdateTaskDto extends CreateTaskDto {
  @ValidateIf((_object, value: unknown) => value !== undefined)
  declare title: string;
}
