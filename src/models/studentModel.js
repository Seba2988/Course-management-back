const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const studentSchema = new mongoose.Schema({
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
	dateOfBirth: {
		type: Date,
		required: true,
		validate(value) {
			const today = new Date();
			if (value >= today) {
				throw new Error("This date is not valid");
			}
		},
	},
	address: {
		type: String,
		required: true,
		trim: true,
		validate(value) {
			if (value.trim().length === 0) {
				throw new Error("This address is not valid");
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
	courses: [
		{
			courseId: {
				type: mongoose.Schema.Types.ObjectId,
				ref: "Course",
			},
		},
	],
});

studentSchema.pre("save", async function (next) {
	const student = this;
	if (student.isModified("password")) {
		student.password = await bcrypt.hash(student.password, 8);
	}
	next();
});

studentSchema.statics.findStudentByEmailAndPassword = async (
	email,
	password
) => {
	const student = await Student.findOne({ email });
	if (!student) throw new Error("Unable to login");
	const isPassMatch = await bcrypt.compare(password, student.password);
	if (!isPassMatch) throw new Error("Unable to login");
	return student;
};

studentSchema.methods.deleteAllCourses = async function () {
	const student = this;
	if (!student) {
		return res.status(404).send({ message: "Student not found" });
	}
	student.courses = [];
	await student.save();
	return student;
};

studentSchema.methods.generateAuthToken = async function () {
	const student = this;
	const token = jwt.sign(
		{
			_id: student._id,
		},
		process.env.TOKEN_SECRET,
		{ expiresIn: "1h" }
	);
	student.tokens = student.tokens.concat({ token });
	await student.save();
	return token;
};

studentSchema.methods.toJSON = function () {
	const student = this;
	const studentObj = student.toObject();
	delete studentObj.password;
	delete studentObj.tokens;
	delete studentObj.__v;
	for (let i = 0; i < studentObj.courses.length; i++) {
		delete studentObj.courses[i].courseId.students;
	}
	return studentObj;
};

const Student = mongoose.model("Student", studentSchema);
module.exports = Student;
