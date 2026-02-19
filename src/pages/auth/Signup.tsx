import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import { Button, Input, Label, Card, CardHeader, CardTitle, CardContent } from '../../components/ui';
import { Receipt } from 'lucide-react';

const signupSchema = z.object({
  first_name: z.string().min(2, "First name is required"),
  last_name: z.string().min(2, "Last name is required"),
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type SignupForm = z.infer<typeof signupSchema>;

export default function Signup() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupForm) => {
    try {
      await api.post('/auth/signup/', data);
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.email?.[0] || 'Signup failed. Please try again.');
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md glass-card border-white/10">
          <CardHeader>
            <div className="flex justify-center mb-4">
               <div className="bg-green-500/20 p-3 rounded-full ring-1 ring-green-500/30">
                  <Receipt className="w-8 h-8 text-green-500" />
               </div>
            </div>
            <CardTitle className="text-center text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-600 bg-clip-text text-transparent">
                Account Created!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
             <p className="text-center text-muted-foreground">
               We've sent a verification email to your inbox. Please click the link to verify your account.
             </p>
             <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-lg text-sm text-yellow-600 dark:text-yellow-400">
                <strong>Demo Mode:</strong> Check the backend console logs for the verification link.
             </div>
             <Button className="w-full font-semibold shadow-lg shadow-primary/20" onClick={() => navigate('/login')}>
               Go to Login
             </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

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
                Create Account
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Join Lumina Finance today
              </p>
            </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name</Label>
                <Input 
                  id="first_name" 
                  className="bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 focus:border-primary/50"
                  {...register('first_name')} 
                />
                {errors.first_name && <p className="text-sm text-destructive">{errors.first_name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name</Label>
                <Input 
                  id="last_name" 
                  className="bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 focus:border-primary/50"
                  {...register('last_name')} 
                />
                {errors.last_name && <p className="text-sm text-destructive">{errors.last_name.message}</p>}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="name@example.com" 
                className="bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 focus:border-primary/50"
                {...register('email')} 
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                className="bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 focus:border-primary/50"
                {...register('password')} 
              />
              {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
            </div>
            
            {error && (
              <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md border border-destructive/20">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full font-semibold shadow-lg shadow-primary/20" isLoading={isSubmitting}>
              Sign Up
            </Button>
            
            <div className="text-center text-sm text-muted-foreground pt-2">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:underline font-medium">
                Login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
