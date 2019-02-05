const { ApolloError } = require('apollo-server-express');
const bcrypt = require('bcryptjs');

const createToken = require('./utils/createToken');
const createError = require('./utils/createError');

const resolvers = {
	Query: {
		login: async (parent, { username, password }, { User }) => {
			try {
				const errors = [];
				let token = null;
				const user = await User.findOne({ username });
				if (!user) {
					createError(
						errors,
						'username',
						'User with that username doesn\'t exist'
					);
					return { token, errors };
				}
				const pwdsAreEqual = await bcrypt.compare(password, user.password);
				if (!pwdsAreEqual) {
					createError(errors, 'password', 'Invalid password');
					return { token, errors };
				}
				token = createToken(user._id, user.username);
				return { token, errors };
			} catch (error) {
				throw new ApolloError(error);
			}
		},
	},
	Mutation: {
		register: async (
			parent,
			{ username, password, passwordConfirm },
			{ User }
		) => {
			try {
				const errors = [];
				let token = null;
				const userExistence = await User.findOne({ username });
				if (userExistence)
					createError(
						errors,
						'username',
						'User with that username already exists'
					);
				if (password.length < 5)
					createError(
						errors,
						'password',
						'Password has to be at least five characters long'
					);
				if (password !== passwordConfirm)
					createError(errors, 'passwordConfirm', 'Passwords don\'t match');
				if (errors.length) return { token, errors };
				const hashedPw = await bcrypt.hash(password, 12);
				const newUser = await new User({
					username,
					password: hashedPw,
				}).save();
				token = await createToken(newUser._id, username);
				return { token, errors };
			} catch (error) {
				throw new ApolloError(error);
			}
		},
	},
};

module.exports = resolvers;
