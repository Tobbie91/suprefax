import { useState, useEffect } from 'react';
import { Camera } from 'lucide-react';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Input,
  FormField,
  Avatar,
  Badge,
} from '@/components/common';
import { useAuthStore } from '@/stores/auth.store';

export default function ProfilePage() {
  const { user, profile, updateProfile } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    companyName: '',
    companyAddress: '',
  });

  // Initialize form data from profile
  useEffect(() => {
    setFormData({
      fullName: profile?.full_name || user?.user_metadata?.full_name || '',
      email: user?.email || '',
      phone: profile?.phone || '',
      companyName: profile?.company_name || '',
      companyAddress: profile?.company_address || '',
    });
  }, [profile, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const { error } = await updateProfile({
      full_name: formData.fullName,
      phone: formData.phone,
      company_name: formData.companyName,
      company_address: formData.companyAddress,
    });

    setIsSaving(false);
    if (!error) {
      setIsEditing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Profile</h1>
          <p className="text-sm text-neutral-600">
            Manage your personal and company information
          </p>
        </div>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Profile Photo */}
          <Card className="lg:col-span-1">
            <CardContent className="flex flex-col items-center pt-6">
              <div className="relative">
                <Avatar size="2xl" fallback={formData.fullName || 'User'} />
                {isEditing && (
                  <button
                    type="button"
                    className="absolute bottom-0 right-0 rounded-full bg-primary-600 p-2 text-white shadow-lg hover:bg-primary-700"
                  >
                    <Camera className="h-4 w-4" />
                  </button>
                )}
              </div>
              <h2 className="mt-4 text-lg font-semibold text-neutral-900">
                {formData.fullName || 'User'}
              </h2>
              <p className="text-sm text-neutral-500">{formData.email}</p>
              <div className="mt-4 flex gap-2">
                {profile?.kyc_status === 'verified' ? (
                  <Badge variant="success" dot>
                    KYC Verified
                  </Badge>
                ) : profile?.kyc_status === 'submitted' ? (
                  <Badge variant="primary" dot>
                    KYC Under Review
                  </Badge>
                ) : (
                  <Badge variant="warning" dot>
                    KYC Pending
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6 lg:col-span-2">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Your personal contact details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField label="Full Name" htmlFor="fullName">
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) =>
                        setFormData({ ...formData, fullName: e.target.value })
                      }
                      disabled={!isEditing}
                    />
                  </FormField>
                  <FormField label="Email" htmlFor="email">
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      disabled
                    />
                  </FormField>
                </div>
                <FormField label="Phone Number" htmlFor="phone">
                  <Input
                    id="phone"
                    value={formData.phone}
                    placeholder="Enter your phone number"
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    disabled={!isEditing}
                  />
                </FormField>
              </CardContent>
            </Card>

            {/* Company Information */}
            <Card>
              <CardHeader>
                <CardTitle>Company Information</CardTitle>
                <CardDescription>
                  Your business details (optional)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField label="Company Name" htmlFor="companyName">
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    placeholder="Enter company name"
                    onChange={(e) =>
                      setFormData({ ...formData, companyName: e.target.value })
                    }
                    disabled={!isEditing}
                  />
                </FormField>
                <FormField label="Company Address" htmlFor="companyAddress">
                  <Input
                    id="companyAddress"
                    value={formData.companyAddress}
                    placeholder="Enter company address"
                    onChange={(e) =>
                      setFormData({ ...formData, companyAddress: e.target.value })
                    }
                    disabled={!isEditing}
                  />
                </FormField>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
