import { Inject, Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from './database.constants';
import { Database } from './database.types';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];

@Injectable()
export class ProfileService {
  constructor(
    @Inject(SUPABASE_CLIENT)
    private readonly supabase: SupabaseClient<Database>,
  ) {}

  async getPendingSummaries(currentTime: string): Promise<ProfileRow[]> {
    if (!currentTime.trim()) {
      throw new Error('currentTime is required');
    }

    const { data, error } = await this.supabase
      .from('profiles')
      .select('id, nylas_grant_id, timezone, summary_time, is_paid')
      .eq('summary_time', currentTime);

    if (error) {
      throw new Error(`Failed to load profiles: ${error.message}`);
    }

    return data ?? [];
  }

  async getProfileById(userId: string): Promise<ProfileRow | null> {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('id, nylas_grant_id, timezone, summary_time, is_paid')
      .eq('id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to load profile: ${error.message}`);
    }

    return data;
  }
}
