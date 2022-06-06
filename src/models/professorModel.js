const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const professorSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		trim: true,
		validate(value) {
			if (value.trim().length === 0) {
				throw new Error("This name is not valid");
			}
		},
	},
	lastName: {
		type: String,
		required: true,
		trim: true,
		validate(value) {
			if (value.trim().length === 0) {
				throw new Error("This last name is not valid");
			}
		},
	},
	email: {
		type: String,
		required: true,
		trim: true,
		lowercase: true,
		unique: true,
		validate(value) {
			if (!validator.isEmail(value)) {
				throw new Error("Invalid E-mail");
			}
		},
	},
	password: {
		type: String,
		required: true,
		trim: true,
		validate(value) {
			if (!validator.isStrongPassword(value)) {
				throw new Error("Invalid password");
			}
		},
	},
	tokens: [
		{
			token: {
				type: String,
				required: true,
			},
		},
	],
});

professorSchema.pre("save", async function (next) {
	const professor = this;
	if (professor.isModified("password")) {
		professor.password = await bcrypt.hash(professor.password, 8);
	}
	next();
});

professorSchema.statics.findProfessorByEmailAndPassword = async (
	email,
	password
) => {
	const professor = await Professor.findOne({ email });
	if (!professor) throw new Error("Unable to login");
	const isPassMatch = await bcrypt.compare(password, professor.password);
	if (!isPassMatch) throw new Error("Unable to login");
	return professor;
};

professorSchema.statics.newProfessor = async (data) => {
	const professor = new Professor(data);
	await professor.save();

	return professor;
};

professorSchema.methods.generateAuthToken = async function () {
	const professor = this;
	const token = jwt.sign(
		{
			_id: professor._id,
		},
		process.env.TOKEN_SECRET,
		{ expiresIn: "1h" }
	);
	professor.tokens = professor.tokens.concat({ token });
	await professor.save();
	return token;
};

professorSchema.methods.toJSON = function () {
	const professor = this;
	const profObj = professor.toObject();
	delete profObj.password;
	delete profObj.tokens;
	return profObj;
};

const Professor = mongoose.model("Professor", professorSchema);
module.exports = Professor;
