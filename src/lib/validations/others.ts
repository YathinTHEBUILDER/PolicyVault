import { z } from 'zod';

export const othersPolicySchema = z.object({
  customer_id: z.string().uuid(),
  policy_number: z.string().min(1, 'Required'),
  insurer_id: z.string().uuid(),
  policy_type: z.string().min(1, 'Required'),
  asset_description: z.string().optional(),
  asset_value: z.coerce.number().min(0).optional(),
  location: z.string().optional(),
  construction_type: z.string().optional(),
  sum_insured: z.coerce.number().min(0),
  premium_amount: z.coerce.number().min(0),
  gst_amount: z.coerce.number().min(0),
  deductible: z.coerce.number().min(0).optional(),
  excess_clause: z.string().optional(),
  coinsurance_details: z.string().optional(),
  policy_file_key: z.string().optional(),
  start_date: z.string().min(1, 'Required'),
  expiry_date: z.string().min(1, 'Required'),
});
