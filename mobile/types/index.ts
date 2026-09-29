export interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  role: 'user' | 'admin';
  created_at?: string;
}

export interface UserStats {
  unlocked_count: number;
  saved_count: number;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  icon?: string;
  prompts_count?: number;
}

export interface PromptSummary {
  id: number;
  title: string;
  slug: string;
  description: string;
  cover_image: string;
  unlock_cost: number;
  category_id?: number;
  category: {
    id: number;
    name: string;
    slug: string;
    icon?: string;
  } | null;
  tags: string[];
  is_featured: boolean;
  is_trending: boolean;
  is_locked: boolean;
  is_saved: boolean;
  views: number;
  unlock_count: number;
  created_at: string;
}

export interface PromptDetail extends PromptSummary {
  prompt_text: string | null; // null if locked, string if unlocked
}

export interface Banner {
  id: number;
  title: string;
  subtitle?: string | null;
  badge_text: string;
  image_url: string;
  cta_text: string;
  action_type: 'prompt' | 'category' | 'url' | 'none';
  prompt_id?: number | null;
  category_id?: number | null;
  category_name?: string | null;
  category_slug?: string | null;
  target_url?: string | null;
  is_active: boolean;
  order: number;
  prompt?: PromptSummary | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

// ─── Reward & Coin System Types ──────────────────────────────────────────────
export interface CoinBalanceResponse {
  balance: number;
  total_earned: number;
  total_spent: number;
}

export interface RewardConfig {
  enabled: boolean;
  coins_per_ad: number;
  daily_ad_limit: number;
  default_prompt_cost: number;
}

export interface TodayRewardStatus {
  enabled: boolean;
  ads_watched: number;
  daily_limit: number;
  coins_per_ad: number;
  coins_earned_today: number;
  remaining_ads: number;
  can_watch: boolean;
  max_coins_today: number;
  balance: number;
}

export interface ClaimRewardResult {
  message: string;
  coins_awarded: number;
  balance: number;
  ads_watched: number;
  daily_limit: number;
  remaining_ads: number;
  coins_earned_today: number;
}

export interface CoinTransaction {
  id: number;
  user_id: number;
  type: 'reward' | 'prompt_unlock' | 'admin_adjustment' | 'refund' | 'bonus';
  amount: number;
  balance_after: number;
  reference_type?: string;
  reference_id?: string;
  description: string;
  created_at: string;
}

export interface UnlockResult {
  message: string;
  prompt_text: string;
  balance: number;
  coins_spent: number;
  prompt: PromptSummary;
}
