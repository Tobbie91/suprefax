import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, FileText, Check, X } from 'lucide-react';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  StatusBadge,
  Textarea,
} from '@/components/common';

export default function AdminApplicationDetailPage() {
  const { id: _id } = useParams<{ id: string }>();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          to="/admin/applications"
          className="mb-4 inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Applications
        </Link>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">
              APP-2024-001
            </h1>
            <p className="text-sm text-neutral-500">
              Visa Proof of Funds • John Doe
            </p>
          </div>
          <StatusBadge status="under_review" />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Application Data */}
          <Card>
            <CardHeader>
              <CardTitle>Application Details</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-sm text-neutral-500">Applicant Name</dt>
                  <dd className="font-medium text-neutral-900">John Doe</dd>
                </div>
                <div>
                  <dt className="text-sm text-neutral-500">Email</dt>
                  <dd className="font-medium text-neutral-900">john@example.com</dd>
                </div>
                <div>
                  <dt className="text-sm text-neutral-500">Visa Type</dt>
                  <dd className="font-medium text-neutral-900">Student Visa</dd>
                </div>
                <div>
                  <dt className="text-sm text-neutral-500">Country</dt>
                  <dd className="font-medium text-neutral-900">United Kingdom</dd>
                </div>
                <div>
                  <dt className="text-sm text-neutral-500">Institution</dt>
                  <dd className="font-medium text-neutral-900">University of London</dd>
                </div>
                <div>
                  <dt className="text-sm text-neutral-500">Loan Amount</dt>
                  <dd className="font-medium text-neutral-900">₦7,000,000</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {/* Uploaded Documents */}
          <Card>
            <CardHeader>
              <CardTitle>Uploaded Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg border border-neutral-200 p-3">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-neutral-400" />
                    <span className="text-sm text-neutral-700">
                      passport_scan.pdf
                    </span>
                  </div>
                  <Button variant="ghost" size="sm">View</Button>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-neutral-200 p-3">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-neutral-400" />
                    <span className="text-sm text-neutral-700">
                      admission_letter.pdf
                    </span>
                  </div>
                  <Button variant="ghost" size="sm">View</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Actions */}
        <div className="space-y-6">
          {/* Admin Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Admin Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Add internal notes about this application..."
                rows={4}
              />
              <Button variant="outline" className="mt-3 w-full">
                Save Notes
              </Button>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" variant="primary">
                <Check className="mr-2 h-4 w-4" />
                Approve Application
              </Button>
              <Button className="w-full" variant="outline">
                <FileText className="mr-2 h-4 w-4" />
                Generate Documents
              </Button>
              <Button className="w-full" variant="destructive">
                <X className="mr-2 h-4 w-4" />
                Reject Application
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
