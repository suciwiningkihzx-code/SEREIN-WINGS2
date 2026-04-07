export interface User {
  id: string;
  name: string;
  is_verified: boolean;
}

export interface CycleProfile {
  user_id: string;
  avg_cycle_length: number;
  avg_period_duration: number;
  last_period_start: string;
}

export interface PeriodLog {
  id: string;
  user_id: string;
  start_date: string;
  end_date?: string;
}

export interface MoodLog {
  id: string;
  user_id: string;
  logged_date: string;
  mood_score: number;
  symptoms: string[];
  journal_text: string;
  cycle_phase: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_type: 'basic' | 'self_care';
  status: 'active' | 'cancelled';
  created_at: string;
}

export interface Partner {
  user_id: string;
  partner_name: string;
  partner_contact: string;
  notify_period_start: boolean;
  notify_bad_mood: boolean;
  notify_cramps: boolean;
}
