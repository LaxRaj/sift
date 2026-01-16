import { Inject, Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from './database.constants';
import { Database } from './database.types';
import { SummaryContent } from '../core';

type SummaryRow = Database['public']['Tables']['summaries']['Row'];

@Injectable()
export class SummaryService {
  constructor(
    @Inject(SUPABASE_CLIENT)
    private readonly supabase: SupabaseClient<Database>,
  ) {}

  async save(
    userId: string,
    content: SummaryContent,
    heatVibe?: string,
  ): Promise<SummaryRow> {
    const { data, error } = await this.supabase
      .from('summaries')
      .insert({
        user_id: userId,
        content,
        heat_vibe: heatVibe ?? null,
      })
      .select('id, user_id, content, heat_vibe, created_at')
      .single();

    if (error) {
      throw new Error(`Failed to save summary: ${error.message}`);
    }

    return data;
  }
}
