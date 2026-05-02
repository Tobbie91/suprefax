import { z } from "zod";

export const applicationSchema = z.object({
  borrower_id: z.string().uuid(),
  agent_id: z.string().uuid(),
  product: z.string().min(1),
  amount: z.number().positive(),
});

export const extensionSchema = z.object({
  application_id: z.string().uuid(),
  new_date: z.string().min(1),
  reason: z.string().min(1),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});
