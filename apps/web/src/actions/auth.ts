'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const authSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export type AuthFormState = {
  error?: string;
  fieldErrors?: {
    email?: string[];
    password?: string[];
  };
};

export async function registerAction(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const rawData = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };

  const parsed = authSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { email, password } = parsed.data;

  let res: Response;
  try {
    res = await fetch(`${process.env.API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
  } catch {
    return { error: 'Unable to connect to the server. Please try again.' };
  }

  if (res.status === 409) {
    return { error: 'This email is already registered. Try logging in instead.' };
  }

  if (!res.ok) {
    return { error: 'Registration failed. Please try again.' };
  }

  const data = (await res.json()) as { access_token: string };
  const cookieStore = await cookies();
  cookieStore.set('access_token', data.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });

  redirect('/dashboard');
}

export async function loginAction(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const rawData = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };

  const parsed = authSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { email, password } = parsed.data;

  let res: Response;
  try {
    res = await fetch(`${process.env.API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
  } catch {
    return { error: 'Unable to connect to the server. Please try again.' };
  }

  if (res.status === 401 || res.status === 400) {
    return { error: 'Invalid email or password. Please try again.' };
  }

  if (!res.ok) {
    return { error: 'Login failed. Please try again.' };
  }

  const data = (await res.json()) as { access_token: string };
  const cookieStore = await cookies();
  cookieStore.set('access_token', data.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });

  redirect('/dashboard');
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('access_token');
  redirect('/login');
}
