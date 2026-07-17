export interface LoanInputs {
  amount: number;
  monthlyRatePct: number;
  durationDays: number;
  startDate?: Date;
}

export interface LoanBreakdown {
  interest: number;
  total: number;
  startDate: Date;
  dueDate: Date;
}

export function computeLoan({ amount, monthlyRatePct, durationDays, startDate }: LoanInputs): LoanBreakdown {
  const start = startDate ?? new Date();
  const due = new Date(start);
  due.setDate(due.getDate() + durationDays);
  const interest = amount * (monthlyRatePct / 100) * (durationDays / 30);
  return {
    interest,
    total: amount + interest,
    startDate: start,
    dueDate: due,
  };
}

const dateFmt = new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric" });
const yearFmt = new Intl.DateTimeFormat("en-US", { year: "numeric" });

export function formatDateRange(start: Date, end: Date): string {
  const sameYear = start.getFullYear() === end.getFullYear();
  const startStr = dateFmt.format(start);
  const endStr = dateFmt.format(end);
  const year = yearFmt.format(end);
  return sameYear ? `${startStr} → ${endStr}, ${year}` : `${startStr}, ${yearFmt.format(start)} → ${endStr}, ${year}`;
}
