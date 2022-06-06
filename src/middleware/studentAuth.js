const jwt = require("jsonwebtoken");
const Student = require("../models/studentModel");

const studentAuth = async (req, res, next) => {
	try {
		const token = req.header("Authorization").replace("Bearer ", "");
		const data = jwt.verify(token, process.env.TOKEN_SECRET);
		const student = await Student.findOne({
			_id: data._id,
			"tokens.token": token,
		});
		if (!student) {
			throw new Error("Student not valid");
		}
		req.student = student;
		req.token = token;
		next();
	} catch (err) {
		res.status(400).send({
			status: 400,
			message: "Not autenticate",
		});
	}
};

module.exports = studentAuth;
