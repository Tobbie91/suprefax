import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Check, Clock, Shield, FileCheck } from 'lucide-react';
import { Button, Card, CardContent } from '@/components/common';

// Service data - in production, this would come from an API
const servicesData: Record<string, {
  title: string;
  description: string;
  longDescription: string;
  icon: string;
  category: string;
  features: string[];
  requirements: string[];
  processingTime: string;
  price: string;
}> = {
  'visa-pof': {
    title: 'Visa Proof of Funds',
    description: 'Secure and verified proof of funds documentation for international visa applications.',
    longDescription: `Our Visa Proof of Funds service provides verified documentation that meets the requirements of embassies and immigration authorities worldwide. Whether you're applying for a student visa, tourist visa, or work permit, we ensure your financial documentation is professional, accurate, and compliant with destination country requirements.`,
    icon: '🎓',
    category: 'Visa Services',
    features: [
      'Bank-verified proof of funds letters',
      'Support for student, visitor, and work visas',
      'Country-specific documentation (UK, Canada, USA, Schengen, etc.)',
      'Quick turnaround within 24-48 hours',
      'Embassy-compliant formatting',
      'Digital and physical copies provided',
      'Dedicated support throughout your application',
    ],
    requirements: [
      'Valid identification (passport)',
      'Completed application form',
      'Visa application details',
      'Institution acceptance letter (for student visas)',
    ],
    processingTime: '24-48 hours',
    price: '₦50,000',
  },
  'lpo-financing': {
    title: 'LPO Financing',
    description: 'Quick access to financing for local purchase orders and contract execution.',
    longDescription: `Our LPO Financing service helps businesses execute contracts and fulfill purchase orders without depleting their working capital. We provide up to 80% of your LPO value, allowing you to take on larger contracts and grow your business.`,
    icon: '📄',
    category: 'Business Financing',
    features: [
      'Up to 80% of LPO value financing',
      'Competitive interest rates',
      'Fast approval within 5 business days',
      'Flexible repayment aligned with payment schedule',
      'Government and private sector LPOs accepted',
      'No collateral required for qualified applicants',
      'Professional contract documentation',
    ],
    requirements: [
      'Company registration documents',
      'Valid LPO or contract award letter',
      'Company bank statements (6 months)',
      'Tax clearance certificate',
      'Directors\' identification',
    ],
    processingTime: '3-5 business days',
    price: 'Contact for quote',
  },
};

export default function ServiceDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const service = slug ? servicesData[slug] : null;

  if (!service) {
    return (
      <div className="px-4 py-16 text-center sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-neutral-900">Service Not Found</h1>
        <p className="mt-4 text-neutral-600">
          The service you're looking for doesn't exist.
        </p>
        <Button className="mt-8" asChild>
          <Link to="/services">View All Services</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Back button */}
        <Link
          to="/services"
          className="mb-8 inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Services
        </Link>

        <div className="grid gap-12 lg:grid-cols-3">
          {/* Main content */}
          <div className="lg:col-span-2">
            <div className="mb-4 text-xs font-medium uppercase tracking-wider text-primary-600">
              {service.category}
            </div>
            <h1 className="text-4xl font-bold text-neutral-900">
              <span className="mr-4">{service.icon}</span>
              {service.title}
            </h1>
            <p className="mt-4 text-lg text-neutral-600">{service.description}</p>
            <p className="mt-6 text-neutral-700">{service.longDescription}</p>

            {/* Features */}
            <div className="mt-12">
              <h2 className="text-xl font-semibold text-neutral-900">
                What's Included
              </h2>
              <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                {service.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-3 text-neutral-700"
                  >
                    <Check className="mt-0.5 h-5 w-5 shrink-0 text-success-500" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {/* Requirements */}
            <div className="mt-12">
              <h2 className="text-xl font-semibold text-neutral-900">
                Requirements
              </h2>
              <ul className="mt-6 space-y-3">
                {service.requirements.map((req) => (
                  <li key={req} className="flex items-start gap-3 text-neutral-700">
                    <div className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-600" />
                    {req}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardContent className="pt-6">

                <div className="mb-6 space-y-4">
                  <div className="flex items-center gap-3 text-sm text-neutral-600">
                    <Clock className="h-5 w-5 text-neutral-400" />
                    <div>
                      <div className="font-medium text-neutral-900">
                        Processing Time
                      </div>
                      {service.processingTime}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-neutral-600">
                    <Shield className="h-5 w-5 text-neutral-400" />
                    <div>
                      <div className="font-medium text-neutral-900">
                        Secure & Confidential
                      </div>
                      Bank-grade security
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-neutral-600">
                    <FileCheck className="h-5 w-5 text-neutral-400" />
                    <div>
                      <div className="font-medium text-neutral-900">
                        Professional Documents
                      </div>
                      Legally compliant
                    </div>
                  </div>
                </div>

                <Button className="w-full" size="lg" asChild>
                  <Link to="/dashboard/applications/new">
                    Apply Now
                  </Link>
                </Button>

                <p className="mt-4 text-center text-xs text-neutral-500">
                  Need help?{' '}
                  <Link to="/contact" className="text-primary-600 hover:underline">
                    Contact our team
                  </Link>
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
