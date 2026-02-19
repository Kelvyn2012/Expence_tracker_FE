import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Card, CardHeader, CardTitle, CardContent, Input, Label } from '../components/ui';
import api from '../lib/api';
import type { Budget } from '../types';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const budgetSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  amount: z.string().min(1, 'Amount is required'),
});

type BudgetFormValues = z.infer<typeof budgetSchema>;

export default function Budgets() {
  const queryClient = useQueryClient();
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const { data: budgets, isLoading } = useQuery<Budget[]>({
    queryKey: ['budgets'],
    queryFn: async () => {
      const { data } = await api.get('/budgets/');
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: BudgetFormValues) => api.post('/budgets/', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      setIsFormOpen(false);
      reset();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: string; values: BudgetFormValues }) => 
      api.patch(`/budgets/${data.id}/`, data.values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      setEditingBudget(null);
      setIsFormOpen(false);
      reset();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/budgets/${id}/`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
  });

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetSchema),
  });

  const onSubmit = (data: BudgetFormValues) => {
    if (editingBudget) {
      updateMutation.mutate({ id: editingBudget.id, values: data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (budget: Budget) => {
    setEditingBudget(budget);
    setValue('category', budget.category);
    setValue('amount', budget.amount);
    setIsFormOpen(true);
  };

  const handleCancel = () => {
    setEditingBudget(null);
    setIsFormOpen(false);
    reset();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Budgets</h2>
        <Button onClick={() => setIsFormOpen(true)} disabled={isFormOpen}>
          <Plus className="mr-2 h-4 w-4" /> New Budget
        </Button>
      </div>

      {isFormOpen && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{editingBudget ? 'Edit Budget' : 'Add New Budget'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input 
                    id="category" 
                    placeholder="e.g. Food, Transport" 
                    {...register('category')} 
                  />
                  {errors.category && <p className="text-sm text-red-500">{errors.category.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Monthly Limit</Label>
                  <Input 
                    id="amount" 
                    type="number" 
                    placeholder="0.00" 
                    {...register('amount')} 
                  />
                  {errors.amount && <p className="text-sm text-red-500">{errors.amount.message}</p>}
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={handleCancel}>Cancel</Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingBudget ? 'Update' : 'Save'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <div>Loading budgets...</div>
        ) : budgets?.length === 0 ? (
          <div className="col-span-full text-center py-10 text-muted-foreground">
            No budgets set. Create one to start tracking your spending limits.
          </div>
        ) : (
          budgets?.map((budget) => (
            <Card key={budget.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{budget.category}</CardTitle>
                <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(budget)}>
                        <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteMutation.mutate(budget.id)}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${budget.amount}</div>
                <p className="text-xs text-muted-foreground">
                  Monthly limit
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
