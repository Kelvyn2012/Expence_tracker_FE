export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  is_email_verified: boolean;
  theme_preference: 'light' | 'dark';
  date_joined: string;
}

export interface Expense {
  id: string;
  title: string;
  amount: string;
  currency: string;
  category: string;
  expense_date: string;
  notes?: string;
  created_at: string;
}

export interface ExpenseSummary {
  total_spend: number;
  currency: string;
  count: number;
  breakdown: Array<{
    category: string;
    total: number;
    count: number;
  }>;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: User;
}
