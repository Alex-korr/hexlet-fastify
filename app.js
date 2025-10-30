import path from 'node:path'
import AutoLoad from '@fastify/autoload'
import view from '@fastify/view'
import pug from 'pug'
import formbody from '@fastify/formbody'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Pass --options via CLI arguments in command to enable these options.
export const options = {}

export default async function (app, opts) {
  // Setup Pug templates
  await app.register(view, {
    engine: { pug },
    root: path.join(__dirname, 'views')
  })

  // Setup form body parser
  await app.register(formbody)

  // Place here your custom code!

  // Do not touch the following lines

  // This loads all plugins defined in plugins
  // those should be support plugins that are reused
  // through your application
  app.register(AutoLoad, {
    dir: path.join(__dirname, 'plugins'),
    options: Object.assign({}, opts)
  })

  // This loads all plugins defined in routes
  // define your routes in one of these
  app.register(AutoLoad, {
    dir: path.join(__dirname, 'routes'),
    options: Object.assign({}, opts)
  })
}
