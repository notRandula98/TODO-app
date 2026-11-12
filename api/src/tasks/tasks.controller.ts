import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { CreateTaskDto, UpdateTaskDto } from './task.dto.js';
import { TasksService } from './tasks.service.js';
import { TaskQueryDto } from './task-query.dto.js';

const queryValidation = new ValidationPipe({
  transform: true,
  whitelist: true,
  forbidNonWhitelisted: true,
  expectedType: TaskQueryDto,
});

const createValidation = new ValidationPipe({
  transform: true,
  whitelist: true,
  forbidNonWhitelisted: true,
  expectedType: CreateTaskDto,
});
const updateValidation = new ValidationPipe({
  transform: true,
  whitelist: true,
  forbidNonWhitelisted: true,
  expectedType: UpdateTaskDto,
});

@Controller('tasks')
export class TasksController {
  constructor(
    @Inject(TasksService) private readonly tasksService: TasksService,
  ) {}

  // Returns a filtered and paginated list of tasks.
  @Get()
  findAll(@Query(queryValidation) query: TaskQueryDto) {
    return this.tasksService.findAll(query);
  }

  // LLM: Handles GET /tasks/:id and returns the requested task.
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tasksService.findOne(id);
  }

  // LLM: Validates POST /tasks input and creates a task.
  @Post()
  create(@Body(createValidation) dto: CreateTaskDto) {
    return this.tasksService.create(dto);
  }

  // LLM: Validates PATCH /tasks/:id input and updates the requested task.
  @Patch(':id')
  update(@Param('id') id: string, @Body(updateValidation) dto: UpdateTaskDto) {
    return this.tasksService.update(id, dto);
  }

  // LLM: Handles DELETE /tasks/:id and returns no content after deletion.
  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string) {
    return this.tasksService.remove(id);
  }
}
