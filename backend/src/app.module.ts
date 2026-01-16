import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EmailModule } from './email/email.module';
import { AIModule } from './ai/ai.module';
import { DatabaseModule } from './database/database.module';
import { OrchestratorModule } from './orchestrator/orchestrator.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const redisUrl = configService.get<string>('REDIS_URL');
        if (!redisUrl) {
          throw new Error('REDIS_URL is required to initialize BullMQ');
        }

        return {
          connection: {
            url: redisUrl,
          },
        };
      },
    }),
    ScheduleModule.forRoot(),
    EmailModule,
    AIModule,
    DatabaseModule,
    OrchestratorModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
