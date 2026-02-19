import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';
import { Button, Input, Label, Card, CardHeader, CardTitle, CardContent } from '../../components/ui';
import { Receipt } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      const response = await api.post('/auth/login/', data);
      login(response.data);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid email or password');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md glass-card border-white/10">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center">
             <div className="bg-primary/20 p-3 rounded-full ring-1 ring-primary/30">
                <Receipt className="w-8 h-8 text-primary" />
             </div>
          </div>
          <div className="space-y-1">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Lumina Finance
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Enter your credentials to access your dashboard
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                className="bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 focus:border-primary/50"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link to="#" className="text-xs text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                className="bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 focus:border-primary/50"
                {...register('password')}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>
            
            {error && (
              <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md border border-destructive/20">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full font-semibold shadow-lg shadow-primary/20" isLoading={isSubmitting}>
              Sign In
            </Button>
            
            <div className="text-center text-sm text-muted-foreground pt-2">
              Don't have an account?{' '}
              <Link to="/signup" className="text-primary hover:underline font-medium">
                Create account
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
