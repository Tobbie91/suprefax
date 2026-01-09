import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';

const footerLinks = {
  services: [
    { name: 'Visa Proof of Funds', href: '/services/visa-pof' },
    { name: 'LPO Financing', href: '/services/lpo-financing' },
    { name: 'Working Capital', href: '/services/working-capital' },
    { name: 'Business Migration', href: '/services/business-migration' },
    { name: 'CAC Registration', href: '/services/cac-registration' },
  ],
  company: [
    { name: 'About Us', href: '/about' },
    { name: 'Contact', href: '/contact' },
    { name: 'Careers', href: '/careers' },
    { name: 'Blog', href: '/blog' },
  ],
  legal: [
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Disclaimer', href: '/disclaimer' },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-neutral-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-600 text-white">
                <span className="text-lg font-bold">S</span>
              </div>
              <span className="text-xl font-semibold text-neutral-900">
                Suprefax
              </span>
            </Link>
            <p className="mt-4 text-sm text-neutral-600">
              Professional document automation for visa services, proof of funds,
              and business financing solutions.
            </p>

            {/* Contact Info */}
            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-3 text-sm text-neutral-600">
                <Mail className="h-4 w-4 text-neutral-400" />
                <span>contact@suprefax.com</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-neutral-600">
                <Phone className="h-4 w-4 text-neutral-400" />
                <span>+234 xxx xxx xxxx</span>
              </div>
              <div className="flex items-start gap-3 text-sm text-neutral-600">
                <MapPin className="mt-0.5 h-4 w-4 text-neutral-400" />
                <span>Lagos, Nigeria</span>
              </div>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-neutral-900">
              Services
            </h3>
            <ul className="space-y-3">
              {footerLinks.services.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-neutral-600 transition-colors hover:text-primary-600"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-neutral-900">
              Company
            </h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-neutral-600 transition-colors hover:text-primary-600"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-neutral-900">Legal</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-neutral-600 transition-colors hover:text-primary-600"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 border-t border-neutral-200 pt-8">
          <p className="text-center text-sm text-neutral-500">
            &copy; {new Date().getFullYear()} Suprefax. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
