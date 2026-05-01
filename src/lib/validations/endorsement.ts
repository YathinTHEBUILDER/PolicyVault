import { z } from 'zod';

export const endorsementSchema = z.object({
  policy_id: z.string().uuid(),
  policy_type: z.enum(['motor', 'health', 'others']),
  change_type: z.string().min(1, 'Required'),
  change_description: z.string().min(1, 'Required'),
  before_values: z.any().optional(),
  after_values: z.any().optional(),
  document_key: z.string().optional(),
  effective_date: z.string().min(1, 'Required'),
});
