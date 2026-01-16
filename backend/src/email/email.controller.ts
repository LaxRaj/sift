import { Controller, Get, Logger, Query } from '@nestjs/common';
import { EmailService } from './email.service';
import { AIService } from '../ai/ai.service';
import { SummaryContent } from '../core';

@Controller('email')
export class EmailController {
  private readonly logger = new Logger(EmailController.name);

  constructor(
    private readonly emailService: EmailService,
    private readonly aiService: AIService,
  ) {}

  @Get('test-sync')
  async testSync(
    @Query('grantId') grantId: string,
    @Query('limit') limit?: string,
  ): Promise<SummaryContent> {
    if (!grantId?.trim()) {
      throw new Error('grantId query parameter is required');
    }

    const parsedLimit = Number(limit);
    const emailLimit = Number.isFinite(parsedLimit) ? parsedLimit : 15;
    const { emails } = await this.emailService.syncEmails(
      grantId,
      emailLimit,
    );
    const summary = await this.aiService.generateSummary(emails);
    this.logger.log(`Heat Sync result: ${JSON.stringify(summary)}`);
    return summary;
  }
}
