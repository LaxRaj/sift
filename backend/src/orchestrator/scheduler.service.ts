import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { ProfileService } from '../database/profile.service';

type SummaryJobData = {
  userId: string;
};

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    private readonly profileService: ProfileService,
    @InjectQueue('SummaryQueue')
    private readonly summaryQueue: Queue<SummaryJobData>,
  ) {}

  @Cron('0,15,30,45 * * * *')
  async scheduleSummaries(): Promise<void> {
    const currentTime = this.getCurrentUtcTime();
    this.logger.log(`Scheduler tick at UTC ${currentTime}`);

    try {
      const profiles =
        await this.profileService.getPendingSummaries(currentTime);

      for (const profile of profiles) {
        try {
          await this.summaryQueue.add('summary', { userId: profile.id });
          this.logger.log(`Enqueued summary for user ${profile.id}`);
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          this.logger.error(
            `Failed to enqueue summary for user ${profile.id}: ${message}`,
          );
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Scheduler failed: ${message}`);
    }
  }

  private getCurrentUtcTime(): string {
    const now = new Date();
    const hours = String(now.getUTCHours()).padStart(2, '0');
    const minutes = String(now.getUTCMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }
}
