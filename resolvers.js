const {
	ApolloError,
	AuthenticationError,
	ForbiddenError,
} = require('apollo-server-express');
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

		getNote: async (parent, { id }, { Note, currentUser }) => {
			if (!currentUser) {
				throw new AuthenticationError(
					'You must be logged in to perform this action!'
				);
			}
			const note = await Note.findOne({ _id: id });
			if (note.userId.toString() !== currentUser._id.toString()) {
				throw new ForbiddenError('Unauthorized for this action!');
			}
			return note;
		},

		getAllNotes: async (parent, args, { Note, currentUser }) => {
			if (!currentUser) {
				throw new AuthenticationError(
					'You must be logged in to perform this action!'
				);
			}
			const notes = await Note.find({ userId: currentUser._id }).sort({
				createdDate: 'desc',
			});
			return notes;
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
				if (username.length < 3) {
					createError(
						errors,
						'username',
						'Username has to be at least 3 characters long'
					);
				}
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
						'Password has to be at least 5 characters long'
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
		// **************************************************************************** NOTES *************************************************************************
		// PROTECTED
		createOrUpdateNote: async (
			parent,
			{ title, tags, content, id },
			{ Note, currentUser }
		) => {
			try {
				const errors = [];
				if (!currentUser) {
					throw new AuthenticationError(
						'You must be logged in to perform this action!'
					);
				}
				if (title === '')
					createError(errors, 'title', 'Enter a title for your note');
				if (errors.length) return { note: null, errors };

				const filteredContent = content
					.replace(/<\/?[^>]+(>|$)/g, '')
					.replace(/&nbsp;/g, ''); // removing HTML tags from string for clean excerpt. &nbsp; check for notes with empty spaces only
				let excerpt = filteredContent.slice(0, 125);
				if (filteredContent.length > 125) excerpt += '...';

				// SET THE PROVIDED TAGS OBJECTS ARRAY (id with uniqid from the client, name) ONTO THE NOTE IN MONGODB

				if (!id) {
					// CREATE
					console.log('creating...');
					const newNote = await new Note({
						title,
						tags,
						content,
						excerpt,
						userId: currentUser._id,
					}).save();
					return { note: newNote, errors };
				} else {
					// UPDATE
					console.log('updating...');
					const note = await Note.findOne({ _id: id });
					if (note.userId.toString() !== currentUser._id.toString()) {
						throw new ForbiddenError('Unauthorized for this action!');
					}
					note.title = title;
					note.tags = tags || [];
					note.content = content;
					await note.save();
					return { note, errors };
				}
			} catch (error) {
				throw new ApolloError(error);
			}
		},

		deleteNote: async (parent, { id }, { Note, currentUser }) => {
			if (!currentUser) {
				throw new AuthenticationError(
					'You must be logged in to perform this action!'
				);
			}
			const note = await Note.findOne({ _id: id });
			if (note.userId.toString() !== currentUser._id.toString()) {
				throw new ForbiddenError('Unauthorized for this action!');
			}
			await note.remove();
			return true;
		},
	},
};

module.exports = resolvers;
