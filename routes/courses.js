import * as yup from 'yup'
import routes from '../lib/routes.js'

// Simple course storage (instead of a database)
const courses = [
  { id: 1, title: 'JavaScript Fundamentals', description: 'Learn the basics of JavaScript programming language' },
  { id: 2, title: 'React Development', description: 'Build modern web applications with React framework' }
]

export default async function (app, opts) {
  // READ: List all courses
  app.get(routes.coursesPath(), async (request, reply) => {
    return reply.view('courses/index', { courses, routes })
  })

  // READ: Show form for creating new course  
  app.get(routes.newCoursePath(), async (request, reply) => {
    return reply.view('courses/new', { routes })
  })

  // READ: Show specific course
  app.get(routes.coursePath(':id'), async (request, reply) => {
    const { id } = request.params
    const course = courses.find((item) => item.id === parseInt(id))
    
    if (!course) {
      return reply.code(404).send({ message: 'Course not found' })
    }
    
    return reply.view('courses/show', { course, routes })
  })

  // CREATE: Create new course
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

  // READ: Show form for editing course
  app.get(routes.editCoursePath(':id'), async (request, reply) => {
    const { id } = request.params
    const course = courses.find((item) => item.id === parseInt(id))
    
    if (!course) {
      return reply.code(404).send({ message: 'Course not found' })
    }
    
    return reply.view('courses/edit', { course, routes })
  })

  // UPDATE: Update existing course
  app.patch(routes.coursePath(':id'), {
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
    const { id } = request.params
    const { title, description } = request.body
    const courseIndex = courses.findIndex((item) => item.id === parseInt(id))
    
    if (courseIndex === -1) {
      return reply.code(404).send({ message: 'Course not found' })
    }
    
    // Check if validation failed
    if (request.validationError) {
      const course = courses[courseIndex]
      const data = {
        course: { ...course, title, description },
        error: request.validationError,
        routes,
      }
      
      return reply.view('courses/edit', data)
    }
    
    // Update course data
    courses[courseIndex] = { 
      ...courses[courseIndex], 
      title: title.trim(), 
      description: description.trim() 
    }
    
    // Redirect to course profile
    return reply.redirect(routes.coursePath(id))
  })

  // DELETE: Delete course
  app.delete(routes.coursePath(':id'), async (request, reply) => {
    const { id } = request.params
    const courseIndex = courses.findIndex((item) => item.id === parseInt(id))
    
    if (courseIndex === -1) {
      return reply.code(404).send({ message: 'Course not found' })
    }
    
    // Remove course from array
    courses.splice(courseIndex, 1)
    
    // Redirect to course list
    return reply.redirect(routes.coursesPath())
  })
}