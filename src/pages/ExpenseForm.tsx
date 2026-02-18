import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../lib/api';
import { Button, Input, Label, Card, CardHeader, CardTitle, CardContent } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft } from 'lucide-react';

const expenseSchema = z.object({
  title: z.string().min(1, "Title is required"),
  amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Amount must be greater than 0"),
  currency: z.string().default("USD"),
  category: z.string().min(1, "Category is required"),
  expense_date: z.string().min(1, "Date is required"),
  notes: z.string().optional(),
});

type ExpenseFormValues = z.infer<typeof expenseSchema>;

export default function ExpenseForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  const [loading, setLoading] = useState(false);
  
  const { register, handleSubmit, reset, formState: { errors, points } } = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
        currency: 'USD',
        expense_date: new Date().toISOString().split('T')[0]
    }
  });

  useEffect(() => {
    if (isEditing) {
      setLoading(true);
      api.get(`/expenses/${id}/`)
        .then(({ data }) => {
           reset({
               ...data,
               amount: String(data.amount) // Ensure string for input
           });
        })
        .catch(() => navigate('/dashboard'))
        .finally(() => setLoading(false));
    }
  }, [id, isEditing, reset, navigate]);

  const onSubmit = async (data: ExpenseFormValues) => {
    try {
      if (isEditing) {
        await api.patch(`/expenses/${id}/`, data);
      } else {
        await api.post('/expenses/', data);
      }
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      alert('Failed to save expense');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Button variant="ghost" onClick={() => navigate('/dashboard')} className="pl-0">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>
      
      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? 'Edit Expense' : 'New Expense'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" {...register('title')} placeholder="Lunch, Uber, etc." />
              {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input id="amount" type="number" step="0.01" {...register('amount')} />
                  {errors.amount && <p className="text-sm text-destructive">{errors.amount.message}</p>}
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Input id="currency" {...register('currency')} />
                  {errors.currency && <p className="text-sm text-destructive">{errors.currency.message}</p>}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input id="category" {...register('category')} placeholder="Food, Transport..." />
                  {errors.category && <p className="text-sm text-destructive">{errors.category.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expense_date">Date</Label>
                  <Input id="expense_date" type="date" {...register('expense_date')} />
                  {errors.expense_date && <p className="text-sm text-destructive">{errors.expense_date.message}</p>}
                </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Input id="notes" {...register('notes')} />
            </div>

            <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => navigate('/dashboard')}>
                    Cancel
                </Button>
                <Button type="submit">
                    {isEditing ? 'Save Changes' : 'Create Expense'}
                </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
