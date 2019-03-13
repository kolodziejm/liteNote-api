const jwt = require('jsonwebtoken');

module.exports = async (id, username) => {
	const payload = { id, username };
	const token = await jwt.sign(payload, process.env.SECRET, {
		expiresIn: '7 days',
	});
	return token;
};
