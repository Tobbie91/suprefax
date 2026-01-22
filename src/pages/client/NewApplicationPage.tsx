import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent, Alert } from '@/components/common';
import { FormEngine } from '@/components/forms';
import { studentPofSchema } from '@/schemas/student-pof.schema';
import type { FormData } from '@/types/form-schema.types';

export default function NewApplicationPage() {
  const navigate = useNavigate();
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Handle form submission
  const handleSubmit = async (data: FormData) => {
    console.log('Form submitted:', data);
    // TODO: Save to Supabase
    // For now, just show success and redirect
    setSubmitSuccess(true);
    setTimeout(() => {
      navigate('/dashboard/applications');
    }, 2000);
  };

  // Handle save draft
  const handleSaveDraft = async (data: FormData, step: number) => {
    console.log('Saving draft at step', step, ':', data);
    // TODO: Save draft to Supabase
  };

  // Handle cancel
  const handleCancel = () => {
    navigate('/dashboard/applications');
  };

  // Success message
  if (submitSuccess) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="py-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success-100 text-3xl">
              ✓
            </div>
            <h3 className="mb-2 text-lg font-semibold text-neutral-900">
              Application Submitted Successfully!
            </h3>
            <p className="mb-4 text-neutral-600">
              Your application has been submitted and is being reviewed. You will be
              redirected to your applications page shortly.
            </p>
            <Alert variant="info">
              You will receive an email confirmation with your application reference
              number.
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          to="/dashboard/applications"
          className="mb-4 inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Applications
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">
            Student Proof of Funds
          </h1>
          <p className="text-sm text-neutral-600">
            Loan agreement for student visa proof of funds
          </p>
        </div>
      </div>

      {/* Form Engine */}
      <FormEngine
        schema={studentPofSchema}
        onSubmit={handleSubmit}
        onSaveDraft={handleSaveDraft}
        onCancel={handleCancel}
      />
    </div>
  );
}
