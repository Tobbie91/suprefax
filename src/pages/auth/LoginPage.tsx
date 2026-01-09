import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
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
import { CheckboxWithLabel } from '@/components/common/Checkbox';
import { useAuthStore } from '@/stores/auth.store';

export default function LoginPage() {
  const navigate = useNavigate();
  const signIn = useAuthStore((state) => state.signIn);

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const { error } = await signIn(formData.email, formData.password);

    if (error) {
      setError(error.message || 'Failed to sign in. Please check your credentials.');
      setIsLoading(false);
      return;
    }

    navigate('/dashboard');
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
          <CardHeader className="text-center">
            <CardTitle>Welcome back</CardTitle>
            <CardDescription>Sign in to your account to continue</CardDescription>
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
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </FormField>

              <FormField label="Password" htmlFor="password" required>
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="cursor-pointer"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  }
                />
              </FormField>

              <div className="flex items-center justify-between">
                <CheckboxWithLabel
                  id="remember"
                  label="Remember me"
                  checked={formData.rememberMe}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, rememberMe: checked as boolean })
                  }
                />
                <Link
                  to="/forgot-password"
                  className="text-sm font-medium text-primary-600 hover:text-primary-700"
                >
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                loading={isLoading}
              >
                Sign In
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-neutral-600">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="font-medium text-primary-600 hover:text-primary-700"
              >
                Create account
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
