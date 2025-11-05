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
      req.flash('success', 'Welcome back! You are now logged in.');
      return reply.redirect('/');
    }

    req.flash('error', 'Wrong username or password');
    return reply.view('session/new', { routes, error: 'Wrong username or password' });
  });

  app.post('/session/delete', (req, reply) => {
    // Remove userId but keep session for flash message
    delete req.session.userId;
    req.flash('success', 'You have been logged out successfully.');
    
    return reply.redirect('/');
  });
};
