import routes from '../lib/routes.js'

export default async function (app, opts) {
  app.get(routes.rootPath(), async function (request, reply) {
    return reply.view('index', { routes })
  })

  app.get(routes.helloPath(), async (request, reply) => {
    const { name } = request.query

    return reply.view('greeting', { 
      name: name ? name.trim() : null,
      routes 
    })
  })
}
