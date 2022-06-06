const express = require("express");
const studentAuth = require("../middleware/studentAuth");
const professorAuth = require("../middleware/professorAuth");
const Student = require("../models/studentModel");

const router = new express.Router();

router.post("/students/new", professorAuth, async (req, res) => {
	const student = new Student(req.body);
	try {
		await student.save();
		res.send({ student });
	} catch (err) {
		res.status(400).send({
			status: 400,
			message: err.message,
		});
	}
});

router.patch("/students/me", studentAuth, async (req, res) => {
	const validUpdates = [];
	for (let att in Student.schema.obj) {
		validUpdates.push(att);
	}
	for (let update in req.body) {
		if (!validUpdates.includes(update)) {
			return res.status(400).send({
				status: 400,
				message: `The update: ${update} is not valid`,
			});
		}
	}
	try {
		for (let update in req.body) {
			req.student[update] = req.body[update];
		}
		await req.student.save();
		res.send(req.student);
	} catch (err) {
		res.status(400).send({
			status: 400,
			message: err.message,
		});
	}
});

router.post("/students/login", async (req, res) => {
	const email = req.body.email;
	const password = req.body.password;
	try {
		const student = await Student.findStudentByEmailAndPassword(
			email,
			password
		);
		const token = await student.generateAuthToken();
		res.send({ student, token });
	} catch (err) {
		res.status(400).send({
			status: 400,
			message: err.message,
		});
	}
});

router.post("/students/logout", studentAuth, async (req, res) => {
	try {
		req.student.tokens = req.student.tokens.filter(
			(tokenDoc) => tokenDoc.token !== req.token
		);
		await req.student.save();
		res.send();
	} catch (err) {
		res.status(500).send(err);
	}
});

router.post("/students/logoutAll", studentAuth, async (req, res) => {
	try {
		req.student.tokens = [];
		await req.student.save();
		res.send();
	} catch (err) {
		res.status(500).send(err);
	}
});

router.delete("/students/delete", professorAuth, async (req, res) => {
	const _id = req.query.id;
	try {
		const student = await Student.findByIdAndRemove(_id);
		if (!student) {
			return res.status(404).send({ message: "Student not found" });
		}
		res.send();
	} catch (err) {
		res.status(500).send(err);
	}
});

router.patch(
	"/students/:studentId/delete-all-courses",
	professorAuth,
	async (req, res) => {
		const _id = req.params.studentId;
		try {
			const student = await Student.findById(_id);
			// if (!student) {
			// 	return res.status(404).send({ message: "Student not found" });
			// }
			// student.courses = [];
			// await student.save();
			res.send(await student.deleteAllCourses());
		} catch (err) {
			res.send(err.message);
		}
	}
);

router.get("/students/all", professorAuth, async (req, res) => {
	try {
		const students = await Student.find({});
		if (students.length === 0) {
			throw new Error({ message: "Students not found" });
		}
		students.sort((a, b) =>
			a.lastName < b.lastName
				? -1
				: a.lastName === b.lastName
				? a.name < b.name
					? -1
					: a.name === b.name
					? 0
					: 1
				: 1
		);
		for (let i = 0; i < students.length; i++) {
			await students[i].populate({
				path: "courses.courseId",
			});
		}
		res.send(students);
	} catch (err) {
		res.send(err);
	}
});

router.delete("/students/delete/:id", professorAuth, async (req, res) => {
	const _id = req.params.id;
	try {
		const student = await Student.findByIdAndRemove(_id);
		if (!student)
			throw new Error({
				status: 404,
				message: "Student not found",
			});
		res.send();
	} catch (err) {
		res.send(err);
	}
});

module.exports = router;
