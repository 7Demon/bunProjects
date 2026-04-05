import { Elysia, t } from 'elysia';
import { registerUser, getAllUsers, getUserById } from '../services/users-service.js';

export const usersRoute = new Elysia({ prefix: '/api/users' })
    .get('/', async () => {
        return await getAllUsers();
    })
    .get('/:id', async ({ params: { id }, set }) => {
        const user = await getUserById(id);
        if (!user) {
            set.status = 404;
            return { error: 'User tidak ditemukan' };
        }
        return user;
    })
    .post('/', async ({ body, set }) => {
        const result = await registerUser(body);
        
        if (result.error) {
            set.status = 400;
            return { error: result.error };
        }
        
        return { data: 'OK' };
    }, {
        body: t.Object({
            name: t.String(),
            email: t.String(),
            password: t.String()
        })
    });
