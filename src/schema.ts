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
    feed: () => links,
  },
  Link: {
    id: (parent: Link) => parent.id,
    description: (parent: Link) => parent.description,
    url: (parent: Link) => parent.url,
  },
  Mutation: {
    post: (parent: unknown, args: { description: string, url: string }) => {
      // 1
      let idCount = links.length;

      // 2
      const link: Link = {
        id: `link-${idCount++}`,
        description: args.description,
        url: args.url,
      };

      links.push(link);

      return link;
    },
  },
};

export const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});