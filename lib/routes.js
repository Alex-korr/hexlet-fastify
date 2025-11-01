// Named routes object - centralized route management
// This module provides all application routes in one place
const routes = {
  // Main page
  rootPath: () => '/',
  
  // Users CRUD routes
  usersPath: () => '/users',
  newUserPath: () => '/users/new',
  userPath: (id) => `/users/${id}`,
  editUserPath: (id) => `/users/${id}/edit`,
  
  // Courses CRUD routes
  coursesPath: () => '/courses',
  newCoursePath: () => '/courses/new',
  coursePath: (id) => `/courses/${id}`,
  editCoursePath: (id) => `/courses/${id}/edit`,
  
  // Other routes
  helloPath: () => '/hello',
}

export default routes