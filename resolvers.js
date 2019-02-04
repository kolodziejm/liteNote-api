const {
	AuthenticationError,
	UserInputError,
} = require('apollo-server-express');

const createToken = require('./utils/createToken');

const resolvers = {
	Query: {},
	Mutation: {},
};

module.exports = resolvers;
