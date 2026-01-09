import { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import {
  Button,
  Card,
  CardContent,
  Input,
  Textarea,
  FormField,
} from '@/components/common';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/common/Select';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement form submission
    console.log('Form submitted:', formData);
  };

  return (
    <div className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-neutral-900">
            Contact Us
          </h1>
          <p className="mt-4 text-lg text-neutral-600">
            Have questions? We'd love to hear from you. Send us a message and
            we'll respond as soon as possible.
          </p>
        </div>

        <div className="mt-16 grid gap-12 lg:grid-cols-3">
          {/* Contact Info */}
          <div className="lg:col-span-1">
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-100">
                  <Mail className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900">Email</h3>
                  <p className="mt-1 text-neutral-600">contact@suprefax.com</p>
                  <p className="text-neutral-600">support@suprefax.com</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-100">
                  <Phone className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900">Phone</h3>
                  <p className="mt-1 text-neutral-600">+234 xxx xxx xxxx</p>
                  <p className="text-neutral-600">Mon-Fri, 9am-5pm WAT</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-100">
                  <MapPin className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900">Office</h3>
                  <p className="mt-1 text-neutral-600">
                    Lagos, Nigeria
                    <br />
                    (By appointment only)
                  </p>
                </div>
              </div>
            </div>

            {/* FAQ prompt */}
            <Card className="mt-8">
              <CardContent className="pt-6">
                <h3 className="font-semibold text-neutral-900">
                  Looking for answers?
                </h3>
                <p className="mt-2 text-sm text-neutral-600">
                  Check out our FAQ section for quick answers to common
                  questions about our services.
                </p>
                <Button variant="outline" className="mt-4 w-full">
                  View FAQs
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <Card className="lg:col-span-2">
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <FormField label="Full Name" htmlFor="name" required>
                    <Input
                      id="name"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                  </FormField>

                  <FormField label="Email Address" htmlFor="email" required>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />
                  </FormField>
                </div>

                <FormField label="Subject" htmlFor="subject" required>
                  <Select
                    value={formData.subject}
                    onValueChange={(value) =>
                      setFormData({ ...formData, subject: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General Inquiry</SelectItem>
                      <SelectItem value="visa-pof">Visa Proof of Funds</SelectItem>
                      <SelectItem value="lpo-financing">LPO Financing</SelectItem>
                      <SelectItem value="working-capital">Working Capital</SelectItem>
                      <SelectItem value="support">Technical Support</SelectItem>
                      <SelectItem value="partnership">Partnership</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField label="Message" htmlFor="message" required>
                  <Textarea
                    id="message"
                    placeholder="How can we help you?"
                    rows={6}
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                  />
                </FormField>

                <Button type="submit" size="lg" className="w-full sm:w-auto">
                  <Send className="mr-2 h-4 w-4" />
                  Send Message
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
