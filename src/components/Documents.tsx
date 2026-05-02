import { useQuery } from "@tanstack/react-query";
import { api } from "../api/client";
import type { DocumentInfo } from "../types/api";

interface Props {
  applicationId: string;
}

const Documents = ({ applicationId }: Props) => {
  const { data, isLoading, isError } = useQuery<DocumentInfo>({
    queryKey: ["documents", applicationId],
    queryFn: () =>
      api.get(`/documents/${applicationId}`).then((res) => res.data),
    enabled: !!applicationId,
  });

  if (isLoading) return <p style={{ color: "#6b7280" }}>Loading documents...</p>;
  if (isError)
    return <p style={{ color: "#dc2626" }}>Failed to load documents.</p>;
  if (!data) return null;

  return (
    <div
      style={{
        padding: 14,
        border: "1px solid #e5e7eb",
        borderRadius: 8,
        background: "#f9fafb",
      }}
    >
      <h3 style={{ margin: "0 0 8px", fontSize: 15 }}>Loan Agreement</h3>
      {data.status === "available" && data.url ? (
        <a
          href={data.url}
          target="_blank"
          rel="noreferrer"
          style={{ color: "#2563eb", fontSize: 14 }}
        >
          Download PDF
        </a>
      ) : (
        <p style={{ color: "#6b7280", fontSize: 14, margin: 0 }}>
          Locked — {data.reason || "Pending signatures or admin approval"}
        </p>
      )}
    </div>
  );
};

export default Documents;
