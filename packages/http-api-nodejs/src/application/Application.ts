import { Logger, HttpServerBuilder, HttpServer } from '@jsfsi-core/typescript-nodejs'
import { Configuration } from './Configuration'
import controllers from '../communication/rest/controllers'
import resolvers from '../communication/graphql/resolvers'

export class Application {
    private server: HttpServer

    public async configure() {
        Logger.configure(Configuration.log.level)
        Logger.info('Configuring application')

        this.server = new HttpServerBuilder()
            .withSwagger({ docsEndpoint: '/rest/docs' })
            .withPort(Configuration.server.port)
            .withJsonParse({ limit: '5mb' })
            .withCookieParser({})
            .withCors(Configuration.server.corsDomains)
            .withControllers(controllers)
            .withGraphql({
                path: '/graphql',
                playground: Configuration.graphql.playground,
                resolvers,
                tracing: Configuration.graphql.tracing,
                introspection: Configuration.graphql.introspection,
            })
            .build()
    }

    public start() {
        Logger.debug('Starting application')
        this.server.start()
    }
}
