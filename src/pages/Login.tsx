import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from '@tanstack/react-router';
import fetchClient from '@/lib/api';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { noop } from '@fxts/core';
import { useCallback } from 'react';

type LoginFormValues = {
  username: string;
  password: string;
};

type LoginResponse = {
  success: boolean;
  message: string;
  token: string;
};

export default function LoginPage() {
  const { handleSubmit, register } = useForm<LoginFormValues>({
    defaultValues: {
      username: '',
      password: '',
    },
  });
  const { mutate, error, isPending } = useMutation<LoginResponse, Error, LoginFormValues>({
    mutationFn: async (data: LoginFormValues) => {
      const response = await fetchClient.post<LoginResponse>('/api/login', data);
      return response.data;
    },
  });
  const navigate = useNavigate();

  const onSubmit = useCallback(({ username, password }: LoginFormValues) => {
    mutate(
      {
        username,
        password,
      },
      {
        onSuccess: (response) => {
          if (response.success) {
            localStorage.setItem('token', response.token);
            navigate({ to: '/reports' });
          }
        },
        onError: noop,
      },
    );
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void handleSubmit(onSubmit)(e);
            }}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="username">ID</Label>
              <Input
                id="username"
                type="username"
                disabled={isPending}
                {...register('username')}
                required
                placeholder="Enter your ID"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                disabled={isPending}
                {...register('password')}
                required
                placeholder="Enter your password"
              />
            </div>
            {error && <p className="text-sm text-red-500">{error.message}</p>}
            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? 'Logging in...' : 'Login'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
