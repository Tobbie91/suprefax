import { Shield, Users, Award, Target } from 'lucide-react';
import { Card, CardContent } from '@/components/common';

const values = [
  {
    icon: Shield,
    title: 'Trust & Security',
    description:
      'We prioritize the security of your sensitive documents and personal information above all else.',
  },
  {
    icon: Users,
    title: 'Client-Centric',
    description:
      'Every service we offer is designed with our clients\' needs and success in mind.',
  },
  {
    icon: Award,
    title: 'Excellence',
    description:
      'We maintain the highest standards in document preparation and professional service delivery.',
  },
  {
    icon: Target,
    title: 'Efficiency',
    description:
      'Our streamlined processes ensure quick turnaround times without compromising quality.',
  },
];

const stats = [
  { value: '5,000+', label: 'Applications Processed' },
  { value: '98%', label: 'Success Rate' },
  { value: '24h', label: 'Average Processing Time' },
  { value: '15+', label: 'Countries Supported' },
];

export default function AboutPage() {
  return (
    <div className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Hero */}
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl">
            About Suprefax
          </h1>
          <p className="mt-6 text-lg text-neutral-600">
            Suprefax is a leading document automation platform specializing in
            visa services, proof of funds documentation, and business financing
            solutions for individuals and businesses across Africa.
          </p>
        </div>

        {/* Stats */}
        <div className="mt-16 grid gap-8 rounded-2xl bg-primary-600 p-8 text-white sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-4xl font-bold">{stat.value}</div>
              <div className="mt-2 text-primary-100">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Mission */}
        <div className="mt-24 grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="text-3xl font-bold text-neutral-900">Our Mission</h2>
            <p className="mt-4 text-lg text-neutral-600">
              To simplify and streamline the document preparation process for
              visa applications, business financing, and legal documentation,
              making these services accessible, efficient, and stress-free for
              everyone.
            </p>
            <p className="mt-4 text-neutral-600">
              We believe that professional documentation should not be a barrier
              to achieving your goals, whether it's studying abroad, growing
              your business, or establishing new ventures. Our platform combines
              technology with expert knowledge to deliver exceptional service.
            </p>
          </div>
          <div className="rounded-2xl bg-neutral-100 p-8">
            <h3 className="text-xl font-semibold text-neutral-900">
              What Sets Us Apart
            </h3>
            <ul className="mt-6 space-y-4">
              <li className="flex items-start gap-3">
                <div className="mt-1 h-2 w-2 rounded-full bg-primary-600" />
                <div>
                  <span className="font-medium text-neutral-900">
                    Expert Team:
                  </span>{' '}
                  <span className="text-neutral-600">
                    Our team includes legal professionals and visa consultants
                    with years of experience.
                  </span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-1 h-2 w-2 rounded-full bg-primary-600" />
                <div>
                  <span className="font-medium text-neutral-900">
                    Technology-Driven:
                  </span>{' '}
                  <span className="text-neutral-600">
                    Our platform automates complex processes while maintaining
                    accuracy.
                  </span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-1 h-2 w-2 rounded-full bg-primary-600" />
                <div>
                  <span className="font-medium text-neutral-900">
                    Client Support:
                  </span>{' '}
                  <span className="text-neutral-600">
                    Dedicated support throughout your application process.
                  </span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Values */}
        <div className="mt-24">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-neutral-900">Our Values</h2>
            <p className="mt-4 text-lg text-neutral-600">
              The principles that guide everything we do.
            </p>
          </div>

          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value) => (
              <Card key={value.title}>
                <CardContent className="pt-6 text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100">
                    <value.icon className="h-6 w-6 text-primary-600" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-neutral-900">
                    {value.title}
                  </h3>
                  <p className="text-sm text-neutral-600">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
