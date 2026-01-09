import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, Check } from 'lucide-react';
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

export default function RegisterPage() {
  const signUp = useAuthStore((state) => state.signUp);

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const strength = passwordStrength();
    if (!strength?.length || !strength?.uppercase || !strength?.lowercase || !strength?.number) {
      setError('Password does not meet strength requirements');
      return;
    }

    setIsLoading(true);

    const { error } = await signUp(formData.email, formData.password, {
      full_name: formData.fullName,
      phone: formData.phone,
    });

    if (error) {
      setError(error.message || 'Failed to create account. Please try again.');
      setIsLoading(false);
      return;
    }

    setSuccess(true);
    setIsLoading(false);
  };

  const passwordStrength = () => {
    const { password } = formData;
    if (!password) return null;

    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
    };

    return checks;
  };

  const strength = passwordStrength();

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
            <CardTitle>Create an account</CardTitle>
            <CardDescription>Get started with Suprefax today</CardDescription>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="py-4 text-center">
                <Alert variant="success" className="mb-4">
                  Account created successfully! Please check your email to verify your account.
                </Alert>
                <Link
                  to="/login"
                  className="font-medium text-primary-600 hover:text-primary-700"
                >
                  Go to Login
                </Link>
              </div>
            ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="error" dismissible onDismiss={() => setError(null)}>
                  {error}
                </Alert>
              )}

              <FormField label="Full Name" htmlFor="fullName" required>
                <Input
                  id="fullName"
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                />
              </FormField>

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

              <FormField label="Phone Number" htmlFor="phone" required>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+234 xxx xxx xxxx"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                />
              </FormField>

              <FormField label="Password" htmlFor="password" required>
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a password"
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

              {/* Password strength indicator */}
              {strength && (
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <Check
                      className={`h-3 w-3 ${
                        strength.length ? 'text-success-500' : 'text-neutral-300'
                      }`}
                    />
                    <span
                      className={
                        strength.length ? 'text-success-600' : 'text-neutral-500'
                      }
                    >
                      At least 8 characters
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check
                      className={`h-3 w-3 ${
                        strength.uppercase && strength.lowercase
                          ? 'text-success-500'
                          : 'text-neutral-300'
                      }`}
                    />
                    <span
                      className={
                        strength.uppercase && strength.lowercase
                          ? 'text-success-600'
                          : 'text-neutral-500'
                      }
                    >
                      Uppercase and lowercase letters
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check
                      className={`h-3 w-3 ${
                        strength.number ? 'text-success-500' : 'text-neutral-300'
                      }`}
                    />
                    <span
                      className={
                        strength.number ? 'text-success-600' : 'text-neutral-500'
                      }
                    >
                      At least one number
                    </span>
                  </div>
                </div>
              )}

              <FormField
                label="Confirm Password"
                htmlFor="confirmPassword"
                required
              >
                <Input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, confirmPassword: e.target.value })
                  }
                />
              </FormField>

              <CheckboxWithLabel
                id="terms"
                label="I agree to the Terms of Service and Privacy Policy"
                checked={formData.agreeToTerms}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, agreeToTerms: checked as boolean })
                }
              />

              <Button
                type="submit"
                className="w-full"
                size="lg"
                loading={isLoading}
                disabled={!formData.agreeToTerms}
              >
                Create Account
              </Button>
            </form>
            )}

            {!success && (
            <div className="mt-6 text-center text-sm text-neutral-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-medium text-primary-600 hover:text-primary-700"
              >
                Sign in
              </Link>
            </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
