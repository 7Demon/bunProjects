import { Elysia, t } from 'elysia';
import { registerUser, getAllUsers, getUserById, loginUser, getCurrentUser, deleteCurrentUser } from '../services/users-service.js';

export const usersRoute = new Elysia({ prefix: '/api/users' })
    .get('/current', async ({ request, set }) => {
        const authHeader = request.headers.get('authorization');
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            set.status = 401;
            return { error: 'unauthorized' };
        }

        const token = authHeader.split(' ')[1];

        try {
            const user = await getCurrentUser(token);
            return { data: user };
        } catch (error) {
            set.status = 401;
            return { error: 'unauthorized' };
        }
    })
    .delete('/current', async ({ request, set }) => {
        const authHeader = request.headers.get('authorization');
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            set.status = 401;
            return { error: 'unauthorized' };
        }

        const token = authHeader.split(' ')[1];

        try {
            const result = await deleteCurrentUser(token);
            return { data: result };
        } catch (error) {
            set.status = 401;
            return { error: 'unauthorized' };
        }
    })
    .post('/login', async ({ body, set }) => {
        try {
            const token = await loginUser(body.email, body.password);
            return { data: token };
        } catch (error) {
            set.status = 401; // Unauthorized
            return { error: error.message };
        }
    }, {
        body: t.Object({
            email: t.String(),
            password: t.String()
        })
    })
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
