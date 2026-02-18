import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import type { Expense, ExpenseSummary } from '../types';

interface ExpenseFilters {
  page?: number;
  // paginationLimit?: number; // Backend default is 20
  from_date?: string;
  to_date?: string;
  category?: string;
  min_amount?: string;
  max_amount?: string;
}

export function useExpenses(filters: ExpenseFilters) {
  const queryClient = useQueryClient();

  // Fetch Expenses List
  const expensesQuery = useQuery({
    queryKey: ['expenses', filters],
    queryFn: async () => {
      // Build query params
      const params = new URLSearchParams();
      if (filters.page) params.append('offset', ((filters.page - 1) * 20).toString());
      if (filters.from_date) params.append('from_date', filters.from_date);
      if (filters.to_date) params.append('to_date', filters.to_date);
      if (filters.category) params.append('category', filters.category);
      
      const { data } = await api.get<{ count: number, results: Expense[] }>(`/expenses/?${params.toString()}`);
      return data;
    },
    placeholderData: (prev) => prev, 
  });

  // Fetch Summary
  const summaryQuery = useQuery({
    queryKey: ['expenses-summary', filters.from_date, filters.to_date], // Summary depends on date range? Or separate month param?
    // User requirement: "GET /api/expenses/summary/?month=YYYY-MM"
    // Let's assume for dashboard we want current month summary by default
    queryFn: async () => {
       // If filter has date range that matches a month, use it, else default to current month
       // Simplified: just fetch current month or all time if no month specified
       const { data } = await api.get<ExpenseSummary>('/expenses/summary/');
       return data;
    }
  });

  // Mutations
  const createExpense = useMutation({
    mutationFn: (newExpense: Partial<Expense>) => api.post('/expenses/', newExpense),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['expenses-summary'] });
    },
  });

  const updateExpense = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Expense> }) => api.patch(`/expenses/${id}/`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['expenses-summary'] });
    },
  });

  const deleteExpense = useMutation({
    mutationFn: (id: string) => api.delete(`/expenses/${id}/`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['expenses-summary'] });
    },
  });

  return {
    expensesQuery,
    summaryQuery,
    createExpense,
    updateExpense,
    deleteExpense
  };
}
