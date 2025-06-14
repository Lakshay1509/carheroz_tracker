
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { AuthForm } from "@/components/AuthForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from '@/contexts/AuthContext';


export default function SignupPage() {
  const [formError, setFormError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && user) {
      router.push('/'); // Redirect if already logged in
    }
  }, [user, authLoading, router]);

  const handleSignup = async (data: { email: string; password: string }) => {
    setIsLoading(true);
    setFormError(null);
    try {
      await createUserWithEmailAndPassword(auth, data.email, data.password);
      router.push("/"); // Redirect to home page on successful signup
    } catch (error: any) {
      setFormError(error.message || "Failed to create an account. Please try again.");
      console.error("Signup error:", error);
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
          <CardTitle className="text-3xl font-bold text-primary-foreground">Create an Account</CardTitle>
          <CardDescription>Join Service Tracker today.</CardDescription>
        </CardHeader>
        <CardContent>
          <AuthForm
            onSubmit={handleSignup}
            submitButtonText="Sign Up"
            formError={formError}
            isLoading={isLoading}
          />
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-accent hover:text-accent/90">
              Login
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
