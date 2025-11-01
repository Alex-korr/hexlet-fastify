import * as yup from 'yup'
import routes from '../lib/routes.js'

// Simple user storage (instead of a database)
const users = [
  { id: 1, name: 'John Smith', email: 'john@example.com' },
  { id: 2, name: 'Jane Doe', email: 'jane@example.com' }
]

export default async function (app, opts) {
  // READ: List all users
  app.get(routes.usersPath(), async (request, reply) => {
    return reply.view('users/index', { users, routes })
  })

  // READ: Show form for creating new user  
  app.get(routes.newUserPath(), async (request, reply) => {
    return reply.view('users/new', { routes })
  })

  // READ: Show specific user
  app.get(routes.userPath(':id'), async (request, reply) => {
    const { id } = request.params
    const user = users.find((item) => item.id === parseInt(id))
    
    if (!user) {
      return reply.code(404).send({ message: 'User not found' })
    }
    
    return reply.view('users/show', { user, routes })
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
      const data = {
        name,
        email,
        password,
        passwordConfirmation,
        error: request.validationError,
        routes,
      }
      
      // Re-render form with errors and preserved data
      return reply.view('users/new', data)
    }
    
    // Data normalization
    const user = {
      id: users.length + 1, // Simple ID generation
      name: name.trim(),    // Remove whitespace
      email: email.trim().toLowerCase(), // Email to lowercase
      password: password    // Password as is (should be hashed in production!)
    }
    
    // Save the user
    users.push(user)
    
    // Redirect to user list
    return reply.redirect(routes.usersPath())
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