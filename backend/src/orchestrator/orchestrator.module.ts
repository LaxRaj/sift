import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { SummaryProcessor } from './summary.processor';
import { SchedulerService } from './scheduler.service';
import { EmailModule } from '../email/email.module';
import { AIModule } from '../ai/ai.module';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'SummaryQueue',
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 1000 },
      },
    }),
    EmailModule,
    AIModule,
    DatabaseModule,
  ],
  providers: [SummaryProcessor, SchedulerService],
})
export class OrchestratorModule {}
