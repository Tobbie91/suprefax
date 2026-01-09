import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Clock, FileCheck, Users } from 'lucide-react';
import { Button, Card, CardContent } from '@/components/common';

const features = [
  {
    icon: Shield,
    title: 'Secure & Confidential',
    description:
      'Bank-grade security ensures your sensitive documents and data remain protected at all times.',
  },
  {
    icon: Clock,
    title: 'Fast Processing',
    description:
      'Streamlined workflows enable quick turnaround times for all your document needs.',
  },
  {
    icon: FileCheck,
    title: 'Professional Documents',
    description:
      'Legal-grade documents generated from professionally crafted templates.',
  },
  {
    icon: Users,
    title: 'Expert Support',
    description:
      'Dedicated team of professionals to guide you through every step of the process.',
  },
];

const services = [
  {
    slug: 'visa-pof',
    title: 'Visa Proof of Funds',
    description:
      'Secure proof of funds documentation for student, visiting, and work visa applications.',
    icon: '🎓',
  },
  {
    slug: 'lpo-financing',
    title: 'LPO Financing',
    description:
      'Quick access to financing for local purchase orders and contract execution.',
    icon: '📄',
  },
  {
    slug: 'working-capital',
    title: 'Working Capital',
    description:
      'Short-term financing solutions to support your business operations and growth.',
    icon: '💼',
  },
  {
    slug: 'business-migration',
    title: 'Business Migration',
    description:
      'Complete support for relocating your business to new jurisdictions.',
    icon: '🌍',
  },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 to-primary-800 px-4 py-24 text-white sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="relative mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Document Automation for{' '}
              <span className="text-secondary-400">Financial Services</span>
            </h1>
            <p className="mt-6 text-lg text-primary-100 sm:text-xl">
              Streamline your visa applications, proof of funds, LPO financing,
              and business documentation with our professional platform.
            </p>
            <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
              <Button size="lg" variant="secondary" asChild>
                <Link to="/services">
                  Explore Services
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10"
                asChild
              >
                <Link to="/contact">Contact Us</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
              Why Choose Suprefax?
            </h2>
            <p className="mt-4 text-lg text-neutral-600">
              We combine technology with expertise to deliver exceptional
              document services.
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <Card key={feature.title} className="text-center">
                <CardContent className="pt-6">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100">
                    <feature.icon className="h-6 w-6 text-primary-600" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-neutral-900">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-neutral-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="bg-neutral-50 px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
              Our Services
            </h2>
            <p className="mt-4 text-lg text-neutral-600">
              Comprehensive solutions for all your document and financing needs.
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((service) => (
              <Link
                key={service.slug}
                to={`/services/${service.slug}`}
                className="group"
              >
                <Card hover className="h-full transition-shadow group-hover:shadow-lg">
                  <CardContent className="pt-6">
                    <div className="mb-4 text-4xl">{service.icon}</div>
                    <h3 className="mb-2 text-lg font-semibold text-neutral-900 group-hover:text-primary-600">
                      {service.title}
                    </h3>
                    <p className="text-sm text-neutral-600">
                      {service.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Button variant="outline" asChild>
              <Link to="/services">
                View All Services
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-600 px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to Get Started?
          </h2>
          <p className="mt-4 text-lg text-primary-100">
            Create an account today and experience seamless document processing.
          </p>
          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <Button size="lg" variant="secondary" asChild>
              <Link to="/register">Create Free Account</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white/10"
              asChild
            >
              <Link to="/contact">Talk to Sales</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
