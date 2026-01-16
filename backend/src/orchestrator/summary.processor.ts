import { Logger } from '@nestjs/common';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { EmailService } from '../email/email.service';
import { AIService } from '../ai/ai.service';
import { ProfileService } from '../database/profile.service';
import { SummaryService } from '../database/summary.service';

type SummaryJobData = {
  userId: string;
};

@Processor('SummaryQueue')
export class SummaryProcessor extends WorkerHost {
  private readonly logger = new Logger(SummaryProcessor.name);

  constructor(
    private readonly profileService: ProfileService,
    private readonly emailService: EmailService,
    private readonly aiService: AIService,
    private readonly summaryService: SummaryService,
  ) {
    super();
  }

  async process(job: Job<SummaryJobData>): Promise<void> {
    const { userId } = job.data;
    this.logger.log(`Summary job started for user ${userId}`);

    try {
      const profile = await this.profileService.getProfileById(userId);
      if (!profile || !profile.nylas_grant_id) {
        this.logger.warn(`No profile/grantId for user ${userId}`);
        return;
      }

      const { nylas_grant_id: grantId, timezone } = profile;
      this.logger.log(`Using timezone ${timezone} for user ${userId}`);

      const { emails, messageIds } = await this.emailService.syncEmails(
        grantId,
      );
      if (emails.length === 0) {
        this.logger.log(`No unread emails for user ${userId}`);
        return;
      }

      const summary = await this.aiService.generateSummary(emails);
      const saved = await this.summaryService.save(
        userId,
        summary,
        summary.overall_sentiment,
      );

      if (!saved?.id) {
        throw new Error('Summary save did not return an id');
      }

      await this.emailService.markAsRead(grantId, messageIds);
      this.logger.log(`Summary job succeeded for user ${userId}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Summary job failed for user ${userId}: ${message}`);
      throw error;
    }
  }
}
