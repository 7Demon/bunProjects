import { Elysia, t } from 'elysia';
import { registerUser, getAllUsers, getUserById, loginUser, getCurrentUser, deleteCurrentUser } from '../services/users-service.js';

export const usersRoute = new Elysia({ prefix: '/api/users' })
    .post('/login', async ({ body }) => {
        const token = await loginUser(body.email, body.password);
        return { data: token };
    }, {
        body: t.Object({
            email: t.String(),
            password: t.String()
        }),
        response: {
            200: t.Object({
                data: t.String()
            }),
            401: t.Object({
                error: t.String()
            })
        }
    })
    .get('/', async () => {
        return await getAllUsers();
    }, {
        response: t.Array(t.Object({
            id: t.Number(),
            name: t.String(),
            email: t.String(),
            password: t.String(),
            createdAt: t.Any()
        }))
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
        }),
        response: {
            200: t.Object({
                data: t.String()
            }),
            400: t.Object({
                error: t.String()
            })
        }
    })
    .group('/current', (app) => app
        .derive(({ request }) => {
            const authHeader = request.headers.get('authorization');
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                throw new Error("unauthorized");
            }
            return {
                token: authHeader.split(' ')[1]
            };
        })
        .get('', async ({ token }) => {
            const user = await getCurrentUser(token);
            return { data: user };
        }, {
            response: {
                200: t.Object({
                    data: t.Object({
                        id: t.Number(),
                        name: t.String(),
                        email: t.String()
                    })
                }),
                401: t.Object({
                    error: t.String()
                })
            }
        })
        .delete('', async ({ token }) => {
            const result = await deleteCurrentUser(token);
            return { data: result };
        }, {
            response: {
                200: t.Object({
                    data: t.Object({
                        message: t.String()
                    })
                }),
                401: t.Object({
                    error: t.String()
                })
            }
        })
    )
    .get('/:id', async ({ params: { id }, set }) => {
        const user = await getUserById(id);
        if (!user) {
            set.status = 404;
            return { error: 'User tidak ditemukan' };
        }
        return user;
    }, {
        response: {
            200: t.Object({
                id: t.Number(),
                name: t.String(),
                email: t.String(),
                password: t.String(),
                createdAt: t.Any()
            }),
            404: t.Object({
                error: t.String()
            })
        }
    });
