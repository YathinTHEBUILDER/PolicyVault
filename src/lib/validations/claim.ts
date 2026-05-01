import { z } from 'zod';

export const claimSchema = z.object({
  policy_id: z.string().uuid(),
  policy_type: z.enum(['motor', 'health', 'others']),
  insurer_claim_number: z.string().optional(),
  date_of_loss: z.string().min(1, 'Required'),
  claim_type: z.string().optional(),
  status: z.string().default('Registered'),
  surveyor_name: z.string().optional(),
  estimated_amount: z.coerce.number().min(0).optional(),
  settled_amount: z.coerce.number().min(0).optional(),
  tds_deducted: z.coerce.number().min(0).optional(),
  settlement_date: z.string().optional(),
  payment_mode: z.string().optional(),
  notes: z.string().optional(),
  document_keys: z.array(z.any()).optional().default([]),
});
