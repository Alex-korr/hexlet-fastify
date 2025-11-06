import * as yup from 'yup'
import routes from '../lib/routes.js'
import db from '../lib/db.js'

export default async function (app, opts) {
  // READ: List all users
  app.get(routes.usersPath(), async (request, reply) => {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM users', (error, users) => {
        if (error) {
          reject(error)
          return
        }
        const messages = reply.flash()
        reply.view('users/index', { users, routes, messages })
          .then(() => resolve())
          .catch(reject)
      })
    })
  })

  // READ: Show form for creating new user  
  app.get(routes.newUserPath(), async (request, reply) => {
    const messages = reply.flash()
    return reply.view('users/new', { routes, messages })
  })

  // READ: Show specific user
  app.get(routes.userPath(':id'), async (request, reply) => {
    const { id } = request.params
    
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE id = ?', [id], (error, user) => {
        if (error) {
          reject(error)
          return
        }
        
        if (!user) {
          reply.code(404).send({ message: 'User not found' })
          resolve()
          return
        }
        
        reply.view('users/show', { user, routes })
          .then(() => resolve())
          .catch(reject)
      })
    })
  })

  // CREATE: Create new user
  app.post(routes.usersPath(), {
    attachValidation: true,
    schema: {
      body: yup.object({
        name: yup.string().min(2, 'Name must be at least 2 characters').required('Name is required'),
        email: yup.string().email('Please enter a valid email').required('Email is required'),
        password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
        passwordConfirmation: yup.string().required('Password confirmation is required'),
      }),
    },
    validatorCompiler: ({ schema }) => (data) => {
      // Check password confirmation matches
      if (data.password !== data.passwordConfirmation) {
        return {
          error: Error('Password confirmation does not match password'),
        }
      }
      
      try {
        const result = schema.validateSync(data)
        return { value: result }
      } catch (e) {
        return { error: e }
      }
    },
  }, async (request, reply) => {
    // Extract data from the form
    const { name, email, password, passwordConfirmation } = request.body
    
    // Check if validation failed
    if (request.validationError) {
      request.flash('error', 'Registration failed! Please check the form.')
      
      // Redirect back to form (Flash will show on next request)
      return reply.redirect(routes.newUserPath())
    }
    
    // Data normalization
    const userName = name.trim()
    const userEmail = email.trim().toLowerCase()
    
    // Save to database
    return new Promise((resolve) => {
      const stmt = db.prepare('INSERT INTO users (name, email) VALUES (?, ?)')
      
      stmt.run([userName, userEmail], function(error) {
        if (error) {
          request.flash('error', 'Failed to create user!')
          reply.redirect(routes.newUserPath())
          resolve()
          return
        }
        
        // Add success flash message
        request.flash('success', 'User successfully created!')
        
        // Redirect to user list
        reply.redirect(routes.usersPath())
        resolve()
      })
      
      stmt.finalize()
    })
  })

  // READ: Show form for editing user
  app.get(routes.editUserPath(':id'), async (request, reply) => {
    const { id } = request.params
    const user = users.find((item) => item.id === parseInt(id))
    
    if (!user) {
      return reply.code(404).send({ message: 'User not found' })
    }
    
    return reply.view('users/edit', { user, routes })
  })

  // UPDATE: Update existing user
  app.patch(routes.userPath(':id'), {
    attachValidation: true,
    schema: {
      body: yup.object({
        name: yup.string().min(2, 'Name must be at least 2 characters').required('Name is required'),
        email: yup.string().email('Please enter a valid email').required('Email is required'),
      }),
    },
    validatorCompiler: ({ schema }) => (data) => {
      try {
        const result = schema.validateSync(data)
        return { value: result }
      } catch (e) {
        return { error: e }
      }
    },
  }, async (request, reply) => {
    const { id } = request.params
    const { name, email } = request.body
    const userIndex = users.findIndex((item) => item.id === parseInt(id))
    
    if (userIndex === -1) {
      return reply.code(404).send({ message: 'User not found' })
    }
    
    // Check if validation failed
    if (request.validationError) {
      const user = users[userIndex]
      const data = {
        user: { ...user, name, email },
        error: request.validationError,
        routes,
      }
      
      return reply.view('users/edit', data)
    }
    
    // Update user data
    users[userIndex] = { 
      ...users[userIndex], 
      name: name.trim(), 
      email: email.trim().toLowerCase() 
    }
    
    // Redirect to user profile
    return reply.redirect(routes.userPath(id))
  })

  // DELETE: Delete user
  app.delete(routes.userPath(':id'), async (request, reply) => {
    const { id } = request.params
    const userIndex = users.findIndex((item) => item.id === parseInt(id))
    
    if (userIndex === -1) {
      return reply.code(404).send({ message: 'User not found' })
    }
    
    // Remove user from array
    users.splice(userIndex, 1)
    
    // Redirect to user list
    return reply.redirect(routes.usersPath())
  })
}