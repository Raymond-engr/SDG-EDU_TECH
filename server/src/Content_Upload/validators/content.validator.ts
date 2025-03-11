import { z } from 'zod';

// Content Validators
export const createContentSchema = z.object({
  body: z.object({
    title: z.string().min(3).max(100),
    description: z.string().min(10).max(1000),
    subject: z.enum(['mathematics', 'science', 'language', 'social_studies', 'arts', 'physical_education', 