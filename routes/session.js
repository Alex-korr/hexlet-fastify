import encrypt from '../lib/encrypt.js';
import routes from '../lib/routes.js';

// Temporary user storage (in real project - use database)
const users = {
  admin: encrypt('qwerty'),
};

export default (app) => {
  app.get('/session/new', (req, reply) => {
    reply.view('session/new', { routes });
  });

  app.post('/session', async (req, reply) => {
    const { username, password } = req.body;
    const hashedPassword = encrypt(password);

    if (users[username] === hashedPassword) {
      req.session.userId = username;
      return reply.redirect('/');
    }

    return reply.view('session/new', { routes, error: 'Wrong username or password' });
  });

  app.post('/session/delete', (req, reply) => {
    req.session.destroy((err) => {
      if (err) {
        return reply.status(500).send('Error logging out');
      }
      reply.redirect('/');
    });
  });
};
