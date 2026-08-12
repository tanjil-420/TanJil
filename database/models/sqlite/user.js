module.exports = function (sequelize) {
	const { Model, DataTypes } = require("sequelize");

	class userModel extends Model {}

	userModel.init({
		userID: {
			type: DataTypes.STRING,
			primaryKey: true
		},
		name: DataTypes.STRING,
		gender: DataTypes.INTEGER,
		vanity: DataTypes.STRING,
		exp: {
			type: DataTypes.BIGINT,
			defaultValue: 0
		},
		money: {
			type: DataTypes.BIGINT,
			defaultValue: 0
		},
		premium: {
			type: DataTypes.JSON,
			defaultValue: {
				isPremium: false
			}
		},
		vip: {
			type: DataTypes.JSON,
			defaultValue: {
				isVip: false
			}
		},
		admin: {
			type: DataTypes.JSON,
			defaultValue: {
				isAdmin: false
			}
		},
		banned: {
			type: DataTypes.JSON,
			defaultValue: {}
		},
		settings: {
			type: DataTypes.JSON,
			defaultValue: {}
		},
		data: {
			type: DataTypes.JSON,
			defaultValue: {}
		},
		othersInfo: {
			type: DataTypes.JSON,
			defaultValue: {}
		}
	}, {
		sequelize,
		modelName: "user"
	});

	return userModel;
};
