export interface Jar {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  target_amount: number;
  current_amount: number;
  currency: string;
  is_public: boolean;
  is_active: boolean;
  deadline: string | null;
  category?: string;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateJarRequest {
  title: string;
  description?: string;
  target_amount: number;
  currency?: string;
  is_public?: boolean;
  deadline?: string;
  category?: string;
  image_url?: string;
}

export interface UpdateJarRequest {
  title?: string;
  description?: string;
  target_amount?: number;
  currency?: string;
  is_public?: boolean;
  deadline?: string;
  category?: string;
  image_url?: string;
}

export interface JarWithContributions extends Jar {
  contributions: Contribution[];
}

