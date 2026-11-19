import { z } from 'zod'
import { Limits } from './constants.js'

export const loginSchema = z.object({
  email: z.string().trim().min(1, 'Write your email.').email('That email does not look right.'),
  password: z.string().min(1, 'Write your password.'),
})

export const registerSchema = z
  .object({
    name: z.string().trim().min(1, 'Tell us your name.').max(Limits.NAME_MAX, 'That name is too long.'),
    email: z.string().trim().min(1, 'Write your email.').email('That email does not look right.').max(255),
    password: z.string().min(Limits.PASSWORD_MIN, `Use at least ${Limits.PASSWORD_MIN} characters.`),
    password_confirmation: z.string().min(1, 'Repeat your password.'),
  })
  .refine((values) => values.password === values.password_confirmation, {
    path: ['password_confirmation'],
    message: 'The passwords do not match.',
  })
