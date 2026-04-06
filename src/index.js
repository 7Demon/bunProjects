import { Elysia } from 'elysia';
import { swagger } from '@elysiajs/swagger';
import { usersRoute } from './routes/users-route.js';

export const app = new Elysia()
  .use(swagger())
  .onError(({ error, set }) => {
    if (error.message === 'unauthorized' || error.message === 'email atau password salah') {
      set.status = 401;
      return { error: error.message };
    }
    return { error: error.message };
  })
  .get('/', () => ({ message: 'Welcome to Elysia + Bun + MySQL' }))
  .use(usersRoute);

if (process.env.NODE_ENV !== 'test') {
  app.listen(process.env.PORT || 3000);
  console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);
}
