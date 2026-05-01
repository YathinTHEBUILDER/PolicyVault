import { z } from 'zod';
import { validateVerhoeff } from '../utils';

export const customerSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  dob: z.string().optional(),
  gender: z.enum(['Male', 'Female', 'Other']).optional(),
  phone_primary: z.string().regex(/^[0-9]{10}$/, 'Phone number must be 10 digits'),
  phone_alternate: z.string().regex(/^[0-9]{10}$/, 'Phone number must be 10 digits').optional().or(z.literal('')),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  address_permanent: z.string().optional(),
  address_mailing: z.string().optional(),
  occupation: z.string().optional(),
  employer: z.string().optional(),
  annual_income_bracket: z.string().optional(),
  nominee_name: z.string().optional(),
  nominee_relationship: z.string().optional(),
  aadhaar_number: z.string()
    .length(12, 'Aadhaar must be 12 digits')
    .refine((val) => validateVerhoeff(val), { message: 'Invalid Aadhaar number (Checksum failed)' })
    .optional().or(z.literal('')),
  pan_number: z.string()
    .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN format (e.g. ABCDE1234F)')
    .optional().or(z.literal('')),
  branch_id: z.string().uuid().optional(),
  assigned_staff_id: z.string().uuid().optional(),
  lead_source: z.string().optional(),
  vip_flag: z.boolean().optional().default(false),
});

export type CustomerFormValues = z.infer<typeof customerSchema>;
