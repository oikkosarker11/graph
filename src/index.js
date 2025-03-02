// import fastify from "fastify";
// import { getGraphQLParameters, processRequest, renderGraphiQL, shouldRenderGraphiQL } from "graphql-helix";
// import 'graphql-import-node';
// import connectDB from "./context.js";
// import schema from "./schema.js";
const fastify = require('fastify');
const { getGraphQLParameters, processRequest, renderGraphiQL, Request, sendResult, shouldRenderGraphiQL } = require('graphql-helix');
require('graphql-import-node');
const schema = require('./schema');
const connectDB = require('./context');


async function main() {
  // console.log("Imported Schema:", schema);

  await connectDB();
  const server = fastify();

  server.route({
    method: ['POST', 'GET'],
    url: '/graphql',
    handler: async (req, reply) => {
      const request = {
        headers: req.headers,
        method: req.method,
        query: req.query,
        body: req.body,
      };

      if (shouldRenderGraphiQL(request)) {
        reply.header('Content-Type', 'text/html');
        reply.send(renderGraphiQL({ endpoint: '/graphql' }));
        return;
      }

      const { operationName, query, variables } = getGraphQLParameters(request);

      const result = await processRequest({
        request,
        schema,
        operationName,
        connectDB,
        query,
        variables,
      });

      reply.send(result);
    },
  });

  server.listen({ port: 3000, host: '0.0.0.0' }, () => {
    console.log('Server is running on http://localhost:3000/');
  });
}

main();
