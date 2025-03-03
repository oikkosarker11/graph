const { PubSub } = require("graphql-subscriptions");
const pubSub = new PubSub();

// EventEmitter-based custom subscription handling
pubSub.asyncIterator = function (triggerName) {
  const ee = this.ee; // Access the underlying EventEmitter

  return {
    next() {
      return new Promise((resolve) => {
        const handler = (payload) => {
          ee.removeListener(triggerName, handler);
          resolve({ value: payload, done: false });
        };
        ee.on(triggerName, handler);
      });
    },
    return() {
      return Promise.resolve({ value: undefined, done: true });
    },
    throw(error) {
      return Promise.reject(error);
    },
    [Symbol.asyncIterator]() {
      return this;
    },
  };
};

module.exports = pubSub;
