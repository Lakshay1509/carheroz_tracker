
"use client";

import type * as React from 'react';
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { AuthForm } from "@/components/AuthForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const [formError, setFormError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  React.useEffect(() => {
    if (!authLoading && user) {
      router.push('/'); // Redirect if already logged in
    }
  }, [user, authLoading, router]);


  const handleLogin = async (data: { email: string; password: string }) => {
    setIsLoading(true);
    setFormError(null);
    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
      router.push("/"); // Redirect to home page on successful login
    } catch (error: any) {
      setFormError(error.message || "Failed to login. Please check your credentials.");
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (authLoading || (!authLoading && user)) {
    return <div className="flex justify-center items-center min-h-screen"><p>Loading...</p></div>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-primary-foreground">Welcome Back!</CardTitle>
          <CardDescription>Sign in to continue to your Service Tracker.</CardDescription>
        </CardHeader>
        <CardContent>
          <AuthForm
            onSubmit={handleLogin}
            submitButtonText="Login"
            formError={formError}
            isLoading={isLoading}
          />
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-semibold text-accent hover:text-accent/90">
              Sign up
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
