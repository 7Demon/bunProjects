import { Elysia } from 'elysia';
import { usersRoute } from './routes/users-route.js';

const app = new Elysia()
  .get('/', () => ({ message: 'Welcome to Elysia + Bun + MySQL' }))
  .use(usersRoute)
  .listen(process.env.PORT || 3000);

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);
