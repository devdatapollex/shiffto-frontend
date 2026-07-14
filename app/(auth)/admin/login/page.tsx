'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';
import { Eye, EyeOff, Shield } from 'lucide-react';

import { authClient } from '@/lib/auth-client';
import { loginSchema, type LoginValues } from '@/lib/validations/auth';
import { ROUTES } from '@/config/routes';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || ROUTES.DASHBOARD;

  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: LoginValues) => {
    const { data, error } = await authClient.signIn.email({
      email: values.email,
      password: values.password,
    });
    if (error) {
      toast.error(error.message || 'Failed to sign in');
      return;
    }

    if (data) {
      if (data.user.role !== 'admin') {
        await authClient.signOut();
        toast.error('Access denied. This portal is for administrators only.');
        return;
      }

      if (!data.user.emailVerified) {
        router.push(`${ROUTES.VERIFY_EMAIL}?email=${encodeURIComponent(values.email)}`);
        return;
      }

      toast.success('Welcome back, Admin!');
      router.push(callbackUrl);
      router.refresh();
    }
  };

  return (
    <Card className="border-none shadow-none">
      <CardHeader className="space-y-3 pb-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-50 text-amber-600 border border-amber-100">
          <Shield className="h-6 w-6" />
        </div>
        <div>
          <CardTitle className="text-2xl font-bold text-primary">Admin Portal</CardTitle>
          <CardDescription className="text-sm text-muted-foreground mt-1">
            Sign in with your administrative credentials to manage the platform.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Admin Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="Enter you email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        className="pr-10"
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        tabIndex={-1}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? 'Authenticating...' : 'Sign In as Admin'}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="justify-center border-t border-gray-50 pt-4">
        <Link href={ROUTES.LOGIN} className="text-sm font-medium text-primary hover:underline">
          Return to User Sign In
        </Link>
      </CardFooter>
    </Card>
  );
}
