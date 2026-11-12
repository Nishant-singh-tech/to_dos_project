const { z } = require('zod');

const email = z.string().trim().toLowerCase().email('Enter a valid email');
const password = z.string().min(6, 'Password must be at least 6 characters').max(100);

exports.registerSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(60),
  email,
  password,
});
exports.loginSchema = z.object({ email, password: z.string().min(1, 'Password is required') });

const base = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200),
  notes: z.string().trim().max(1000),
  priority: z.enum(['High', 'Medium', 'Low']),
  due: z.union([z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Due date must be YYYY-MM-DD'), z.literal('')]),
  tags: z.array(z.string().trim().toLowerCase().min(1).max(20)).max(5),
  recurrence: z.enum(['none', 'daily', 'weekly', 'monthly']),
  done: z.boolean(),
});

exports.createTaskSchema = base.partial().required({ title: true });
exports.updateTaskSchema = base.partial();
exports.reorderSchema = z.object({ ids: z.array(z.string().regex(/^[a-f\d]{24}$/i)).max(2000) });
