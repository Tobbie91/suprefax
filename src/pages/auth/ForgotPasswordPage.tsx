import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail } from 'lucide-react';
import {
  Button,
  Input,
  FormField,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Alert,
} from '@/components/common';
import { useAuthStore } from '@/stores/auth.store';

export default function ForgotPasswordPage() {
  const resetPassword = useAuthStore((state) => state.resetPassword);

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const { error } = await resetPassword(email);

    if (error) {
      setError(error.message || 'Failed to send reset link. Please try again.');
      setIsLoading(false);
      return;
    }

    setIsLoading(false);
    setIsSubmitted(true);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link to="/" className="mb-8 flex items-center justify-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-600 text-white">
            <span className="text-lg font-bold">S</span>
          </div>
          <span className="text-xl font-semibold text-neutral-900">Suprefax</span>
        </Link>

        <Card>
          {!isSubmitted ? (
            <>
              <CardHeader className="text-center">
                <CardTitle>Forgot your password?</CardTitle>
                <CardDescription>
                  Enter your email and we'll send you a reset link
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <Alert variant="error" dismissible onDismiss={() => setError(null)}>
                      {error}
                    </Alert>
                  )}

                  <FormField label="Email" htmlFor="email" required>
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </FormField>

                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    loading={isLoading}
                  >
                    Send Reset Link
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to sign in
                  </Link>
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="py-8 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-success-100">
                <Mail className="h-6 w-6 text-success-600" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-neutral-900">
                Check your email
              </h3>
              <p className="mb-6 text-sm text-neutral-600">
                We've sent a password reset link to{' '}
                <span className="font-medium">{email}</span>
              </p>
              <Button variant="outline" asChild>
                <Link to="/login">Back to sign in</Link>
              </Button>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
