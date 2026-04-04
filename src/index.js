import { Elysia } from 'elysia';
import { userRoutes } from './routes/users.js';

const app = new Elysia()
  .get('/', () => ({ message: 'Welcome to Elysia + Bun + MySQL' }))
  .use(userRoutes)
  .listen(process.env.PORT || 3000);

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);
