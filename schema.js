const typeDefs = `
  scalar Date

  type Error {
    field: String
    message: String
  }

  type Token {
    token: String
    errors: [Error]
  }

  type User {
    _id: ID!
    username: String!
    password: String!
  }

  type Note {
    _id: ID!
    title: String!
    tags: [String]
    content: String
    excerpt: String
    userId: ID!
    createdAt: Date
    updatedAt: Date
  }

  type Query {
    login (username: String!, password: String!): Token
  }

  type Mutation {
    register (username: String!, password: String!, passwordConfirm: String!): Token
  }
`;

module.exports = typeDefs;
