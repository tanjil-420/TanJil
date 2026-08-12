const mongoose = require("mongoose");
const { Schema } = mongoose;

const userModel = new Schema({
	userID: {
		type: String,
		unique: true
	},
	name: String,
	gender: String,
	vanity: String,
	exp: {
		type: Number,
		default: 0
	},
	money: {
		type: Number,
		default: 1000
	},
	premium: {
		type: Object,
		default: () => ({
			isPremium: false
		})
	},
	vip: {
		type: Object,
		default: () => ({
			isVip: false
		})
	},
	admin: {
		type: Object,
		default: () => ({
			isAdmin: false
		})
	},
	banned: {
		type: Object,
		default: {}
	},
	settings: {
		type: Object,
		default: {}
	},
	data: {
		type: Object,
		default: {}
	},
	othersInfo: {
		type: Object,
		default: {}
	}
}, {
	timestamps: true,
	minimize: false
});

module.exports = mongoose.model("users", userModel);
