import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
} from '@/components/common';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // TODO: Implement actual password reset
    console.log('Reset password:', formData);
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    }, 1000);
  };

  const passwordStrength = () => {
    const { password } = formData;
    if (!password) return null;

    return {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
    };
  };

  const strength = passwordStrength();

  if (isSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4 py-12">
        <Card className="w-full max-w-md">
          <CardContent className="py-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-success-100">
              <Check className="h-6 w-6 text-success-600" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-neutral-900">
              Password Reset Successful
            </h3>
            <p className="text-sm text-neutral-600">
              Redirecting you to sign in...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

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
            <CardTitle>Reset your password</CardTitle>
            <CardDescription>Enter your new password below</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <FormField label="New Password" htmlFor="password" required>
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter new password"
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
                  placeholder="Confirm new password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, confirmPassword: e.target.value })
                  }
                />
              </FormField>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                loading={isLoading}
              >
                Reset Password
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
