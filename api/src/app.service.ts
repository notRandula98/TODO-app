import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  // Provides the application's greeting.
  getHello(): string {
    return 'Hello World!';
  }
}
