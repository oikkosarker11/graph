import { makeExecutableSchema } from "@graphql-tools/schema";
import typeDefs from "./schema.graphql";

// 1
type Link = {
  id: string;
  url: string;
  description: string;
}

// 2
const links: Link[] = [{
  id: 'link-0',
  url: 'www.howtographql.com',
  description: 'Fullstack tutorial for GraphQL'
}]

const resolvers = {
  Query: {
    info: () => `This is the API of a Hackernews Clone`,
    // 3
    feed: () => links,
  },
  // 4
  Link: {
    id: (parent: Link) => parent.id,
    description: (parent: Link) => parent.description,
    url: (parent: Link) => parent.url,
  }
}

export const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});