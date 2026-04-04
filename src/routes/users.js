import { Elysia, t } from 'elysia';
import { db } from '../db/index.js';
import { users } from '../db/schema.js';
import { eq } from 'drizzle-orm';

export const userRoutes = new Elysia({ prefix: '/users' })
  .get('/', async () => {
    return await db.select().from(users);
  })
  .post('/', async ({ body }) => {
    await db.insert(users).values(body);
    return { status: 'success', message: 'User created' };
  }, {
    body: t.Object({
      name: t.String(),
      email: t.String(),
    })
  })
  .get('/:id', async ({ params: { id } }) => {
    const result = await db.select().from(users).where(eq(users.id, parseInt(id)));
    return result[0] || { status: 'error', message: 'User not found' };
  });
