import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { CleanEmail, SummaryContent } from '../core';

@Injectable()
export class AIService {
  private readonly logger = new Logger(AIService.name);
  private readonly openai: OpenAI;
  private readonly organization?: string;
  private readonly project?: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is required to initialize OpenAI');
    }

    const organization = this.configService.get<string>('OPENAI_ORG');
    const project = this.configService.get<string>('OPENAI_PROJECT');
    this.organization = organization ?? undefined;
    this.project = project ?? undefined;
    this.logger.log(
      `OpenAI config: org=${organization ?? 'default'}, project=${project ?? 'default'}`,
    );

    this.openai = new OpenAI({ apiKey });
  }

  async generateSummary(emails: CleanEmail[]): Promise<SummaryContent> {
    this.logger.log(
      `OpenAI request: summarize ${emails.length} emails (org=${this.organization ?? 'default'}, project=${this.project ?? 'default'})`,
    );
    const systemPrompt = {
      role: 'system',
      objective:
        'Produce a concise "Heat Sync" summary strictly matching the output schema.',
      categories: {
        Urgent:
          'Time-sensitive, critical, or high-impact messages that need immediate attention.',
        'Action Needed':
          'Requires a response or follow-up, but not as urgent as Urgent.',
        Newsletter: 'Newsletters, marketing, or low-priority broadcasts.',
        Personal: 'Personal updates or non-urgent human messages.',
      },
      constraints: [
        'Be concise and professional.',
        'Only use the provided emails.',
        'Each email must appear under exactly one category.',
        'Each email entry must include subject, snippet, and heat_score (1-10).',
        'Return only JSON that conforms to the schema.',
      ],
    };

    const userPayload = {
      role: 'user',
      emails,
    };

    const response = await this.openai.responses.parse({
      model: 'gpt-5-mini',
      input: [
        {
          role: 'system',
          content: [{ type: 'input_text', text: JSON.stringify(systemPrompt) }],
        },
        {
          role: 'user',
          content: [{ type: 'input_text', text: JSON.stringify(userPayload) }],
        },
      ],
      text: {
        format: {
          type: 'json_schema',
          name: 'email_summary',
          strict: true,
          schema: {
            type: 'object',
            additionalProperties: false,
            required: [
              'summary_title',
              'overall_sentiment',
              'categories',
              'suggested_actions',
            ],
            properties: {
              summary_title: { type: 'string' },
              overall_sentiment: { type: 'string' },
              categories: {
                type: 'array',
                items: {
                  type: 'object',
                  additionalProperties: false,
                  required: ['name', 'emails'],
                  properties: {
                    name: {
                      type: 'string',
                      enum: [
                        'Urgent',
                        'Action Needed',
                        'Newsletter',
                        'Personal',
                      ],
                    },
                    emails: {
                      type: 'array',
                      items: {
                        type: 'object',
                        additionalProperties: false,
                        required: ['subject', 'snippet', 'heat_score'],
                        properties: {
                          subject: { type: 'string' },
                          snippet: { type: 'string' },
                          heat_score: {
                            type: 'integer',
                            minimum: 1,
                            maximum: 10,
                          },
                        },
                      },
                    },
                  },
                },
              },
              suggested_actions: {
                type: 'array',
                items: { type: 'string' },
              },
            },
          },
        },
      },
    });

    if (!response.output_parsed) {
      throw new Error('OpenAI response did not include parsed output');
    }

    const responseId = (response as { id?: string }).id ?? 'unknown';
    const requestId =
      (response as { request_id?: string }).request_id ?? 'unknown';
    this.logger.log(
      `OpenAI response received (responseId: ${responseId}, requestId: ${requestId})`,
    );
    return response.output_parsed as SummaryContent;
  }
}
