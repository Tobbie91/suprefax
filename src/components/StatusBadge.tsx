import { CSSProperties } from "react";

interface StatusStyle {
  background: string;
  color: string;
  label: string;
}

const STATUS_COLORS: Record<string, StatusStyle> = {
  overdue: { background: "#fee2e2", color: "#dc2626", label: "Overdue" },
  due: { background: "#fef3c7", color: "#d97706", label: "Due Soon" },
  paid: { background: "#dcfce7", color: "#16a34a", label: "Paid" },
  pending: { background: "#f3f4f6", color: "#6b7280", label: "Pending" },
  approved: { background: "#dbeafe", color: "#2563eb", label: "Approved" },
};

interface Props {
  status: string;
}

const StatusBadge = ({ status }: Props) => {
  const style: StatusStyle = STATUS_COLORS[status] || {
    background: "#f3f4f6",
    color: "#6b7280",
    label: status,
  };

  const styleObj: CSSProperties = {
    padding: "2px 10px",
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 600,
    background: style.background,
    color: style.color,
    display: "inline-block",
  };

  return <span style={styleObj}>{style.label}</span>;
};

export default StatusBadge;
