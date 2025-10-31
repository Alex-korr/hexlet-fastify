import * as yup from 'yup'

// Simple user storage (instead of a database)
const users = [
  { id: 1, name: 'John Smith', email: 'john@example.com' },
  { id: 2, name: 'Jane Doe', email: 'jane@example.com' }
]

// Simple course storage
const courses = [
  { id: 1, title: 'JavaScript Fundamentals', description: 'Learn the basics of JavaScript programming language' },
  { id: 2, title: 'React Development', description: 'Build modern web applications with React framework' }
]

// Named routes object
const routes = {
  // Main page
  rootPath: () => '/',
  
  // Users
  usersPath: () => '/users',
  newUserPath: () => '/users/new',
  
  // Courses
  coursesPath: () => '/courses',
  newCoursePath: () => '/courses/new',
  
  // Other
  helloPath: () => '/hello',
}

export default async function (app, opts) {
  app.get(routes.rootPath(), async function (request, reply) {
    return reply.view('index', { routes })
  })

   app.get(routes.usersPath(), async (request, reply) => {
    return reply.view('users/index', { users, routes })
  })

  app.get(routes.newUserPath(), async (request, reply) => {
    return reply.view('users/new', { routes })
  })

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

  // Course routes
  app.get(routes.coursesPath(), async (_request, reply) => {
    return reply.view('courses/index', { courses, routes })
  })

  app.get(routes.newCoursePath(), async (_request, reply) => {
    return reply.view('courses/new', { routes })
  })

  app.post(routes.coursesPath(), {
    attachValidation: true,
    schema: {
      body: yup.object({
        title: yup.string().min(2, 'Title must be at least 2 characters').required('Title is required'),
        description: yup.string().min(10, 'Description must be at least 10 characters').required('Description is required'),
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
    // Extract data from the form
    const { title, description } = request.body
    
    // Check if validation failed
    if (request.validationError) {
      const data = {
        title,
        description,
        error: request.validationError,
        routes,
      }
      
      // Re-render form with errors and preserved data
      return reply.view('courses/new', data)
    }
    
    // Create course
    const course = {
      id: courses.length + 1,
      title: title.trim(),
      description: description.trim(),
    }
    
    // Save the course
    courses.push(course)
    
    // Redirect to course list
    return reply.redirect(routes.coursesPath())
  })

  app.get(routes.helloPath(), async (request, reply) => {
    const { name } = request.query

    if (name) {
      return `Hello, ${name}!`
    } else {
      return 'Hello, World!'
    }
  })  

}
