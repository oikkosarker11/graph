const mongoose = require('mongoose');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const typeDefs = require('./schema.graphql');
const { Link, User, Vote } = require('./mongoSchema');
const { APP_SECRET } = require("./auth");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pubSub = require('./pubsub')

const resolvers = {
  Query: {
    info: () => `This is the API of a Hackernews Clone`,
    feed: async (parent, args, context) => {
      const { filter, skip, take, orderBy } = args;

      // Create a filter condition for Mongoose
      const where = filter
        ? {
            $or: [
              { description: { $regex: filter, $options: "i" } }, // Case-insensitive search
              { url: { $regex: filter, $options: "i" } },
            ],
          }
        : {};

      // Convert Prisma's SortOrder to Mongoose sort object
      let sortOptions = {};
      if (orderBy) {
        sortOptions = Object.fromEntries(
          Object.entries(orderBy).map(([key, value]) => [key, value === "asc" ? 1 : -1])
        );
      }


      // Find matching links with pagination and sorting
      const links = await Link.find(where)
        .skip(skip || 0)
        .limit(take || 10)
        .sort(sortOptions);

              // Count total documents matching the filter
      const totalCount = links.length;

      return {
        count: totalCount,
        links,
      };
    },
    me: async (parent, args, context) => {
      if (context.currentUser === null) {
        throw new Error("Unauthenticated!");
      }

      try {
        // Assuming currentUser contains the user ID
        const user = await User.findById(context.currentUser.id);
        if (!user) {
          throw new Error("User not found");
        }
        return user;
      } catch (error) {
        throw new Error("Error fetching user");
      }
    },
  },

  Mutation: {
    signup: async (parent, args, context) => {
      try {
        // 1. Hash the password
        const password = await bcrypt.hash(args.password, 10);

        // 2. Create a new user in MongoDB
        const user = new User({
          name: args.name,
          email: args.email,
          password: password,
        });
        await user.save();

        // 3. Generate a JWT token
        const token = jwt.sign({ userId: user._id }, APP_SECRET);

        // 4. Return token and user
        return {
          token,
          user,
        };
      } catch (error) {
        throw new Error("Error signing up: " + error.message);
      }
    },

    login: async (parent, args, context) => {
      try {
        // 1. Find the user by email
        const user = await User.findOne({ email: args.email });
        if (!user) {
          throw new Error("No such user found");
        }

        // 2. Validate the password
        const valid = await bcrypt.compare(args.password, user.password);
        if (!valid) {
          throw new Error("Invalid password");
        }

        // 3. Generate a JWT token
        const token = jwt.sign({ userId: user._id }, APP_SECRET);

        // 4. Return token and user
        return {
          token,
          user,
        };
      } catch (error) {
        throw new Error("Error logging in: " + error.message);
      }
    },
    post: async (parent, args, context) => {
      if (!context.currentUser) {
        throw new Error("Unauthenticated!");
      }

      try {
        // Create a new link (post)
        const newLink = new Link({
          url: args.url,
          description: args.description,
          postedBy: context.currentUser.id, // Assuming currentUser has an 'id' field
        });

        // Save the new link to the database
        await newLink.save();
        const addLink = await User.findByIdAndUpdate(
          { _id: context.currentUser.id },
          { $push: { links: newLink.id } },
          { new: true },
      );
      context.pubSub.publish("newLink", { createdLink: newLink });
        return newLink; // Return the newly created link
      } catch (error) {
        throw new Error("Failed to create post: " + error.message);
      }
    },
    vote : async (parent, args, context) => {
      // 1: Check if the user is authenticated
      if (!context.currentUser) {
        throw new AuthenticationError("You must log in to upvote!");
      }
    
      const userId = context.currentUser.id;
      const linkId = args.linkId;
    
      // 2: Check if the user has already voted
      const existingVote = await Vote.findOne({ user: userId, link: linkId });
      if (existingVote) {
        throw new Error(`Already voted for link: ${linkId}`);
      }
    
      // 3: Create a new vote
      const newVote = await Vote.create({ user: userId, link: linkId });

      const addVoteUser = await User.findByIdAndUpdate(
        { _id: userId },
        { $push: { votes: newVote.id } },
        { new: true },
    );
    const addVoteLink = await Link.findByIdAndUpdate(
      { _id: linkId },
      { $push: { votes: newVote.id } },
      { new: true },
  );
      // 4: Publish the vote event
      context.pubSub.publish("newVote", { createdVote: newVote });
    
      return newVote;
    },
  },

  Link: {
    // id: (parent) => parent.id,
    // description: (parent) => parent.description,
    // url: (parent) => parent.url,
    postedBy: async (parent, args, context) => {
      if (!parent.postedBy) {
        return null;
      }

      try {
        // Assuming parent.postedById refers to the user who posted the link
        const user = await User.findById(parent.postedBy);
        return user; // Return the user who posted the link
      } catch (error) {
        throw new Error("Error fetching the user who posted the link");
      }
    },
    votes: async (parent, args, context) => {
      return await Vote.find({ link: parent.id });
    },
  },
  // AuthPayLoad:{
  //   token: (parent) => parent.token, 
  //   user: (parent) => parent.user
  // },
  User: {
    id: (parent) => parent.id,
    name: (parent) => parent.name,
    email: (parent) => parent.email,
    links: async (parent, args, context) => {
      try {
        // Assuming parent.id refers to the ID of the user
        const links = await Link.find({ postedBy: parent.id }); // Querying links posted by the user
        return links;
      } catch (error) {
        throw new Error("Error fetching links for user");
      }
    },
    votes: async (parent, args, context) => {
      return await Vote.find({ user: parent.id });
    },
  },
  Subscription: {
    newLink: {
      subscribe: (parent, args, context) => {
        return context.pubSub.asyncIterator("newLink");
      },
      resolve: (payload) => {
        return payload.createdLink;
      },
    },
    newVote : {
      subscribe: (parent, args, context) => {
        return context.pubSub.asyncIterator("newVote");
      },
      resolve: (payload) => {
        return payload.createdVote;
      },
    },
  },
  Vote : {
    link: async (parent, args, context) => {
      return await Link.findById(parent.link);
    },
    user: async (parent, args, context) => {
      return await User.findById(parent.user);
    },
  },
};

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

module.exports = schema;
