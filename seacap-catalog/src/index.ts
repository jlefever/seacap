import Fastify, { FastifyInstance, RouteShorthandOptions } from "fastify";

const CATALOG_PORT = Number(process.env.CATALOG_PORT) || 3006;

const server: FastifyInstance = Fastify({
    logger: true
});

const opts: RouteShorthandOptions = {
    schema: {
        response: {
            200: {
                type: "object",
                properties: {
                    pong: {
                        type: "string"
                    }
                }
            }
        }
    }
};

server.get("/ping", opts, async (req, res) =>
{
    return { pong: "it worked!" };
});

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