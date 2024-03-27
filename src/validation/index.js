import z from "zod";

export const registerAndLoginSchema = z.object({
  fullname: z.string().min(1).max(255).trim().optional(),
  email: z.string().email().min(1),
  password: z.string().min(2).max(255).trim(),
  username: z.string().min(1).max(255).trim(),
})


export const videoSchema = z.object({
  title: z.string().min(1).max(255).trim(),
  description: z.string().min(1).max(255).trim(),
})