const typeDefs = `
  type HelloWorld {
    hello: String
  }

  type Query {
    queryHello: HelloWorld
  }

  type Mutation {
    mutateHello: HelloWorld
  }
`;

module.exports = typeDefs;
