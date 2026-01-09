import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button, Card, CardContent, Alert } from '@/components/common';
import { FormEngine } from '@/components/forms';
import { proofOfFundsSchema } from '@/schemas/proof-of-funds.schema';
import type { FormData } from '@/types/form-schema.types';

// Service options for selection
const services = [
  {
    slug: 'visa-pof',
    title: 'Visa Proof of Funds',
    description: 'For student, visitor, and work visa applications',
    icon: '🎓',
    schema: proofOfFundsSchema,
  },
  {
    slug: 'lpo-financing',
    title: 'LPO Financing',
    description: 'Financing for local purchase orders and contracts',
    icon: '📄',
    schema: null, // Coming soon
  },
  {
    slug: 'working-capital',
    title: 'Working Capital',
    description: 'Short-term business financing solutions',
    icon: '💼',
    schema: null, // Coming soon
  },
  {
    slug: 'business-migration',
    title: 'Business Migration',
    description: 'Relocate your business to new jurisdictions',
    icon: '🌍',
    schema: null, // Coming soon
  },
  {
    slug: 'cac-registration',
    title: 'CAC Registration',
    description: 'Nigerian business registration services',
    icon: '🏢',
    schema: null, // Coming soon
  },
];

export default function NewApplicationPage() {
  const { serviceSlug } = useParams<{ serviceSlug?: string }>();
  const navigate = useNavigate();
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // If no service selected, show service selection
  if (!serviceSlug) {
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
          <h1 className="text-2xl font-bold text-neutral-900">New Application</h1>
          <p className="text-sm text-neutral-600">Select a service to get started</p>
        </div>

        {/* Service Selection */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <Link
              key={service.slug}
              to={`/dashboard/applications/new/${service.slug}`}
            >
              <Card
                hover
                className="h-full cursor-pointer transition-shadow hover:shadow-md"
              >
                <CardContent className="pt-6">
                  <div className="mb-4 text-4xl">{service.icon}</div>
                  <h3 className="mb-1 font-semibold text-neutral-900">
                    {service.title}
                  </h3>
                  <p className="text-sm text-neutral-600">{service.description}</p>
                  {!service.schema && (
                    <span className="mt-2 inline-block rounded bg-neutral-100 px-2 py-0.5 text-xs text-neutral-500">
                      Coming Soon
                    </span>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  // Show form for selected service
  const selectedService = services.find((s) => s.slug === serviceSlug);

  if (!selectedService) {
    return (
      <div className="text-center">
        <p className="text-neutral-600">Service not found</p>
        <Button className="mt-4" asChild>
          <Link to="/dashboard/applications/new">Select a Service</Link>
        </Button>
      </div>
    );
  }

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
    navigate('/dashboard/applications/new');
  };

  // If no schema available yet
  if (!selectedService.schema) {
    return (
      <div className="space-y-6">
        <div>
          <Link
            to="/dashboard/applications/new"
            className="mb-4 inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Change Service
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{selectedService.icon}</span>
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">
                {selectedService.title}
              </h1>
              <p className="text-sm text-neutral-600">
                {selectedService.description}
              </p>
            </div>
          </div>
        </div>

        <Card>
          <CardContent className="py-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 text-3xl">
              🚧
            </div>
            <h3 className="mb-2 text-lg font-semibold text-neutral-900">
              Coming Soon
            </h3>
            <p className="mb-4 text-neutral-600">
              This service application form is currently under development.
            </p>
            <Button variant="outline" asChild>
              <Link to="/dashboard/applications/new">Choose Another Service</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
          to="/dashboard/applications/new"
          className="mb-4 inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Change Service
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-3xl">{selectedService.icon}</span>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">
              {selectedService.title}
            </h1>
            <p className="text-sm text-neutral-600">{selectedService.description}</p>
          </div>
        </div>
      </div>

      {/* Form Engine */}
      <FormEngine
        schema={selectedService.schema}
        onSubmit={handleSubmit}
        onSaveDraft={handleSaveDraft}
        onCancel={handleCancel}
      />
    </div>
  );
}
