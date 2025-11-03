import routes from '../lib/routes.js'

export default async function (app, opts) {
  app.get(routes.rootPath(), async function (request, reply) {
    const visited = request.cookies.visited
    reply.cookie('visited', true)
    
    return reply.view('index', { routes, visited })
  })

  app.get(routes.helloPath(), async (request, reply) => {
    const { name } = request.query

    return reply.view('greeting', { 
      name: name ? name.trim() : null,
      routes 
    })
  })
}
