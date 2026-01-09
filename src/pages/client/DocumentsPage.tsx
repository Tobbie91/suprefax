import { Download, Eye, Search, Filter, FileText } from 'lucide-react';
import {
  Button,
  Card,
  CardContent,
  Input,
  DocumentStatusBadge,
  NoDocuments,
} from '@/components/common';

// TODO: Replace with real data from Supabase
// Empty array for new users
const documents: Array<{
  id: string;
  name: string;
  type: string;
  application: string;
  status: 'draft' | 'pending_approval' | 'approved' | 'released';
  createdAt: string;
}> = [];

export default function DocumentsPage() {
  const hasDocuments = documents.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Documents</h1>
        <p className="text-sm text-neutral-600">
          Access and download your generated documents
        </p>
      </div>

      {/* Filters - only show if there are documents */}
      {hasDocuments && (
        <Card>
          <CardContent className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <Input placeholder="Search documents..." className="pl-10" />
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Documents List */}
      {hasDocuments ? (
        <div className="space-y-4">
          {documents.map((doc) => (
            <Card key={doc.id} hover>
              <CardContent className="py-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100">
                      <FileText className="h-5 w-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-medium text-neutral-900">{doc.name}</p>
                      <p className="text-sm text-neutral-500">
                        {doc.application} • {doc.createdAt}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <DocumentStatusBadge status={doc.status} />
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="mr-2 h-4 w-4" />
                        Preview
                      </Button>
                      {doc.status === 'released' && (
                        <Button size="sm">
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12">
            <NoDocuments />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
