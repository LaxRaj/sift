import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from '@supabase/supabase-js';
import { ProfileService } from './profile.service';
import { SummaryService } from './summary.service';
import { Database } from './database.types';
import { SUPABASE_CLIENT } from './database.constants';

@Module({
  providers: [
    {
      provide: SUPABASE_CLIENT,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const url = configService.get<string>('SUPABASE_URL');
        const serviceRoleKey = configService.get<string>(
          'SUPABASE_SERVICE_ROLE_KEY',
        );

        if (!url || !serviceRoleKey) {
          throw new Error(
            'SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required',
          );
        }

        return createClient<Database>(url, serviceRoleKey, {
          auth: { persistSession: false },
        });
      },
    },
    ProfileService,
    SummaryService,
  ],
  exports: [ProfileService, SummaryService, SUPABASE_CLIENT],
})
export class DatabaseModule {}
