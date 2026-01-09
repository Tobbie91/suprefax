import { Link } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/components/common';

const services = [
  {
    slug: 'visa-pof',
    title: 'Visa Proof of Funds',
    description:
      'Secure and verified proof of funds documentation for international visa applications including student, visitor, and work visas.',
    icon: '🎓',
    category: 'Visa Services',
    features: [
      'Bank-verified proof of funds letters',
      'Support for multiple visa types',
      'Quick turnaround time',
      'Embassy-compliant documentation',
    ],
    startingPrice: '₦50,000',
  },
  {
    slug: 'lpo-financing',
    title: 'LPO Financing',
    description:
      'Quick access to financing for local purchase orders and contract execution with flexible terms.',
    icon: '📄',
    category: 'Business Financing',
    features: [
      'Up to 80% of LPO value',
      'Competitive interest rates',
      'Fast approval process',
      'Flexible repayment terms',
    ],
    startingPrice: 'Contact for quote',
  },
  {
    slug: 'working-capital',
    title: 'Working Capital',
    description:
      'Short-term financing solutions to support your business operations, inventory, and growth initiatives.',
    icon: '💼',
    category: 'Business Financing',
    features: [
      'Revolving credit facilities',
      'Invoice financing options',
      'Inventory financing',
      'Operational expense coverage',
    ],
    startingPrice: 'Contact for quote',
  },
  {
    slug: 'business-migration',
    title: 'Business Migration',
    description:
      'Complete support for relocating your business to new jurisdictions with all necessary documentation.',
    icon: '🌍',
    category: 'Business Services',
    features: [
      'Company registration assistance',
      'Legal documentation preparation',
      'Compliance advisory',
      'Post-migration support',
    ],
    startingPrice: '₦200,000',
  },
  {
    slug: 'cac-registration',
    title: 'CAC Registration',
    description:
      'Professional assistance with Corporate Affairs Commission registration for Nigerian businesses.',
    icon: '🏢',
    category: 'Business Services',
    features: [
      'Business name registration',
      'Company incorporation',
      'Annual returns filing',
      'Document retrieval services',
    ],
    startingPrice: '₦30,000',
  },
  {
    slug: 'loan-agreements',
    title: 'Loan Agreements',
    description:
      'Professionally drafted loan agreements and related legal documentation for various financing arrangements.',
    icon: '📝',
    category: 'Legal Documents',
    features: [
      'Customized agreement templates',
      'Legally compliant documents',
      'Multiple agreement types',
      'Professional review included',
    ],
    startingPrice: '₦25,000',
  },
];

export default function ServicesPage() {
  return (
    <div className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-neutral-900">
            Our Services
          </h1>
          <p className="mt-4 text-lg text-neutral-600">
            Comprehensive document automation and financing solutions for
            individuals and businesses.
          </p>
        </div>

        {/* Services Grid */}
        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <Card key={service.slug} className="flex flex-col">
              <CardHeader>
                <div className="mb-2 text-xs font-medium uppercase tracking-wider text-primary-600">
                  {service.category}
                </div>
                <div className="mb-2 text-4xl">{service.icon}</div>
                <CardTitle>{service.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col">
                <p className="mb-4 text-sm text-neutral-600">
                  {service.description}
                </p>
                <ul className="mb-6 flex-1 space-y-2">
                  {service.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2 text-sm text-neutral-700"
                    >
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-success-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto">
                  <Button variant="outline" className="w-full" asChild>
                    <Link to={`/services/${service.slug}`}>
                      Learn More
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-24 rounded-2xl bg-primary-50 px-8 py-16 text-center">
          <h2 className="text-2xl font-bold text-neutral-900">
            Not sure which service you need?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-neutral-600">
            Our team is here to help you find the right solution for your
            specific needs. Contact us for a free consultation.
          </p>
          <Button className="mt-8" size="lg" asChild>
            <Link to="/contact">Contact Us</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
