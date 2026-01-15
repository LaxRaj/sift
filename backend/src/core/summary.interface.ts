import { HeatSyncCategory } from './heat-sync-category.enum';

export interface Summary {
  id: string;
  userId: string;
  content: string;
  heatLevel: HeatSyncCategory;
  createdAt: Date;
}
