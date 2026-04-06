import { Elysia } from 'elysia';
import { usersRoute } from './routes/users-route.js';

const app = new Elysia()
  .onError(({ error, set }) => {
    if (error.message === 'unauthorized') {
      set.status = 401;
      return { error: 'unauthorized' };
    }
  })
  .get('/', () => ({ message: 'Welcome to Elysia + Bun + MySQL' }))
  .use(usersRoute)
  .listen(process.env.PORT || 3000);

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);
