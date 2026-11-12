import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service.js';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // Returns the application's greeting at the root endpoint.
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
