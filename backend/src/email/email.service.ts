import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Nylas from 'nylas';
import { CleanEmail } from '../core';

type NylasMessage = {
  id: string;
  subject?: string | null;
  body?: string | null;
  bodyPlain?: string | null;
  snippet?: string | null;
};

type NylasFolder = {
  id: string;
  name?: string | null;
  attributes?: string[] | null;
};

type NylasListResponse = {
  data: NylasMessage[];
};

type NylasFolderListResponse = {
  data: NylasFolder[];
};

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly nylas: ReturnType<typeof createNylasClient>;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('NYLAS_API_KEY');
    if (!apiKey) {
      throw new Error('NYLAS_API_KEY is required to initialize Nylas');
    }

    this.nylas = createNylasClient(apiKey);
  }

  async syncEmails(
    grantId: string,
    limit = 20,
  ): Promise<{ emails: CleanEmail[]; messageIds: string[] }> {
    if (!grantId.trim()) {
      throw new Error('grantId is required');
    }

    const safeLimit = Math.max(1, Math.min(limit, 50));
    const inboxFolderId = await this.getInboxFolderId(grantId);

    const response = await this.nylas.messages.list({
      identifier: grantId,
      queryParams: {
        limit: safeLimit,
        unread: true,
        ...(inboxFolderId ? { in: [inboxFolderId] } : {}),
      },
    });

    const messages = this.extractMessages(response);

    const emails = messages.map((message) => {
      const bodyText = this.extractBodyText(message);
      const subject = (message.subject ?? '').trim() || '(No subject)';
      const snippet =
        (message.snippet ?? '').trim() ||
        bodyText.slice(0, 200).trim();
      this.logger.log(`Nylas message ID: ${message.id}`);
      return { id: message.id, subject, snippet, bodyText };
    });

    return { emails, messageIds: emails.map((email) => email.id) };
  }

  async markAsRead(grantId: string, messageIds: string[]): Promise<void> {
    if (!grantId.trim()) {
      throw new Error('grantId is required');
    }

    if (messageIds.length === 0) {
      return;
    }

    await Promise.all(
      messageIds.map((messageId) =>
        this.nylas.messages.update({
          identifier: grantId,
          messageId,
          requestBody: { unread: false },
        }),
      ),
    );
  }

  private extractMessages(response: unknown): NylasMessage[] {
    if (!this.isNylasListResponse(response)) {
      throw new Error('Unexpected response from Nylas messages.list');
    }

    return response.data;
  }

  private extractBodyText(message: NylasMessage): string {
    const rawBody =
      message.bodyPlain ?? message.body ?? message.snippet ?? '';
    if (typeof rawBody !== 'string') {
      return '';
    }

    return this.stripHtml(rawBody);
  }

  private stripHtml(value: string): string {
    return value
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private isNylasListResponse(value: unknown): value is NylasListResponse {
    if (!value || typeof value !== 'object') {
      return false;
    }

    const candidate = value as { data?: unknown };
    if (!Array.isArray(candidate.data)) {
      return false;
    }

    return candidate.data.every((item) => {
      if (!item || typeof item !== 'object') {
        return false;
      }
      const message = item as { id?: unknown };
      return typeof message.id === 'string';
    });
  }

  private async getInboxFolderId(grantId: string): Promise<string | null> {
    const response = await this.nylas.folders.list({ identifier: grantId });
    if (!this.isNylasFolderListResponse(response)) {
      throw new Error('Unexpected response from Nylas folders.list');
    }

    const inboxFolder = response.data.find((folder) => {
      const name = (folder.name ?? '').toLowerCase();
      const attributes = folder.attributes ?? [];
      return (
        name === 'inbox' ||
        attributes.some((attribute) => attribute.toLowerCase() === '\\inbox')
      );
    });

    return inboxFolder?.id ?? null;
  }

  private isNylasFolderListResponse(
    value: unknown,
  ): value is NylasFolderListResponse {
    if (!value || typeof value !== 'object') {
      return false;
    }

    const candidate = value as { data?: unknown };
    if (!Array.isArray(candidate.data)) {
      return false;
    }

    return candidate.data.every((item) => {
      if (!item || typeof item !== 'object') {
        return false;
      }
      const folder = item as { id?: unknown };
      return typeof folder.id === 'string';
    });
  }
}

function createNylasClient(apiKey: string) {
  return new Nylas({ apiKey });
}
