const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const noteSchema = new Schema(
	{
		title: {
			type: String,
			required: true,
		},
		tags: [Object],
		content: {
			type: String,
		},
		excerpt: {
			type: String,
		},
		userId: {
			type: Schema.Types.ObjectId,
			ref: 'Users',
			required: true,
		},
	},
	{
		timestamps: true,
	}
);

module.exports = mongoose.model('Notes', noteSchema);
