import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Download, Clock, FileText } from 'lucide-react';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  StatusBadge,
  DocumentStatusBadge,
} from '@/components/common';

// Mock data
const applicationData = {
  id: '1',
  reference: 'APP-2024-001',
  service: 'Visa Proof of Funds',
  serviceIcon: '🎓',
  status: 'draft' as const,
  createdAt: '2024-01-15',
  updatedAt: '2024-01-16',
  submittedAt: '2024-01-15',
  formData: {
    'Applicant Name': 'John Doe',
    'Email': 'john@example.com',
    'Visa Type': 'Student Visa',
    'Destination Country': 'United Kingdom',
    'Institution': 'University of London',
    'Programme': 'MSc Computer Science',
    'Loan Amount': '₦7,000,000',
  },
  documents: [
    {
      id: '1',
      name: 'Loan Agreement',
      status: 'released' as const,
      createdAt: '2024-01-16',
    },
    {
      id: '2',
      name: 'Declaration Form',
      status: 'pending_approval' as const,
      createdAt: '2024-01-16',
    },
  ],
  timeline: [
    { status: 'Application Submitted', date: '2024-01-15 10:30 AM' },
    { status: 'Under Review', date: '2024-01-16 09:00 AM' },
  ],
};

export default function ApplicationDetailPage() {
  const { id: _id } = useParams<{ id: string }>();

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
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{applicationData.serviceIcon}</span>
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">
                {applicationData.service}
              </h1>
              <p className="text-sm text-neutral-500">
                {applicationData.reference}
              </p>
            </div>
          </div>
          <StatusBadge status={applicationData.status} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Application Details */}
          <Card>
            <CardHeader>
              <CardTitle>Application Details</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-4 sm:grid-cols-2">
                {Object.entries(applicationData.formData).map(([key, value]) => (
                  <div key={key}>
                    <dt className="text-sm text-neutral-500">{key}</dt>
                    <dd className="font-medium text-neutral-900">{value}</dd>
                  </div>
                ))}
              </dl>
            </CardContent>
          </Card>

          {/* Documents */}
          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
            </CardHeader>
            <CardContent>
              {applicationData.documents.length > 0 ? (
                <div className="space-y-3">
                  {applicationData.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between rounded-lg border border-neutral-200 p-4"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-neutral-400" />
                        <div>
                          <p className="font-medium text-neutral-900">
                            {doc.name}
                          </p>
                          <p className="text-xs text-neutral-500">
                            Created: {doc.createdAt}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <DocumentStatusBadge status={doc.status} />
                        {doc.status === 'released' && (
                          <Button variant="outline" size="sm">
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-neutral-500">
                  Documents will appear here once generated
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {applicationData.timeline.map((event, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="h-2 w-2 rounded-full bg-primary-600" />
                      {index < applicationData.timeline.length - 1 && (
                        <div className="h-full w-0.5 bg-neutral-200" />
                      )}
                    </div>
                    <div className="pb-4">
                      <p className="text-sm font-medium text-neutral-900">
                        {event.status}
                      </p>
                      <p className="text-xs text-neutral-500">{event.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Info */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-neutral-400" />
                  <div>
                    <p className="text-xs text-neutral-500">Created</p>
                    <p className="text-sm font-medium text-neutral-900">
                      {applicationData.createdAt}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-neutral-400" />
                  <div>
                    <p className="text-xs text-neutral-500">Last Updated</p>
                    <p className="text-sm font-medium text-neutral-900">
                      {applicationData.updatedAt}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          {applicationData.status === 'draft' && (
            <Card>
              <CardContent className="pt-6">
                <Button className="w-full">Continue Application</Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
