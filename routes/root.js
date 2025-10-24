export default async function (fastify, opts) {
  fastify.get('/', async function (request, reply) {
    return { root: true }
  })

   fastify.get('/users', async (request, reply) => {
    return 'GET /users'
  })

  fastify.post('/users', async (request, reply) => {
    return 'POST /users'
  })

  fastify.get('/hello', async (request, reply) => {
    const { name } = request.query

    if (name) {
      return `Hello, ${name}!`
    } else {
      return 'Hello, World!'
    }
  })  

}
