import fastify from "fastify";
import fastifyHelmet from "fastify-helmet";
import fastifySwagger from "fastify-swagger";
import schemas from "./schemas";

const CATALOG_PORT = Number(process.env.CATALOG_PORT) || 4007;

const server = fastify({ logger: true });

server.register(fastifyHelmet);

server.register(fastifySwagger, {
    routePrefix: "/swagger",
    staticCSP: true,
    exposeRoute: true,
    swagger: {
        info: {
            title: "Catalog",
            description: "An API for accessing software engineering artifact data",
            version: "0.0.1"
        },
        host: `localhost:${CATALOG_PORT}`,
        schemes: ["http"],
        consumes: ["application/json"],
        produces: ["application/json"],
        definitions: schemas
    }
});

server.get(
    "/repos",
    {
        schema: {
            operationId: "getAllRepos",
            description: "Get all repos",
            response: {
                200: {
                    type: "array",
                    items: schemas.repo
                }
            }
        }
    },
    async (req, res) =>
    {
        return [{
            name: "depends",
            displayName: "Depends"
        }];
    }
);

const start = async () =>
{
    try
    {
        console.log(`Starting seacap-catalog on port ${CATALOG_PORT}...`);
        await server.listen(CATALOG_PORT);
    }
    catch (err)
    {
        server.log.error(err);
        process.exit(1);
    }
};

start();