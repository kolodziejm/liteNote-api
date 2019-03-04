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
  
  type Tag {
    id: ID!
    tagName: String!
  }

  input TagInput {
    id: ID!
    tagName: String!
  }  

  type Note {
    _id: ID
    title: String
    tags: [Tag]
    content: String
    excerpt: String
    userId: ID
    createdAt: Date
    updatedAt: Date
  }

  type NoteWithError {
    note: Note
    errors: [Error]
  }

  type Query {
    login (username: String!, password: String!): Token
    getNote (id: ID!): Note
    getAllNotes: [Note]
  }

  type Mutation {
    register (username: String!, password: String!, passwordConfirm: String!): Token
    createOrUpdateNote(title: String!, tags: [TagInput], content: String, id: ID): NoteWithError
    deleteNote(id: ID!): Boolean!
  }
`;

module.exports = typeDefs;
