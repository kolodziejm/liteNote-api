require('dotenv').config({ path: 'variables.env' });
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { ApolloServer } = require('apollo-server-express');

const typeDefs = require('./schema');
const resolvers = require('./resolvers');

const User = require('./models/User');
const Note = require('./models/Note');

const PORT = process.env.PORT || 4000;

const app = express();

const server = new ApolloServer({
	typeDefs,
	resolvers,
	context: async ({ req }) => {
		let currentUser = null;
		const bearerToken = req.headers.authorization;
		if (bearerToken) {
			const token = bearerToken.split(' ')[1];
			const decoded = jwt.verify(token, process.env.SECRET);
			currentUser = await User.findOne({ _id: decoded.id });
		}

		return { User, Note, currentUser };
	},
});
server.applyMiddleware({ app });

app.listen({ port: PORT }, () => {
	mongoose
		.connect(process.env.MONGO_URI)
		.then(() => {
			console.log(`DB connected and app listening on port ${PORT}`);
		})
		.catch(err => console.log(err));
});
