const express = require("express");
const professorAuth = require("../middleware/professorAuth");
const Course = require("../models/courseModel");
const Student = require("../models/studentModel");
const studentsMiddleware = require("../middleware/studentsMiddleware");

const router = new express.Router();

router.post("/courses/new", professorAuth, async (req, res) => {
	const course = new Course(req.body);
	try {
		await course.save();
		res.send({ course });
	} catch (err) {
		res.status(400).send({
			status: 400,
			message: err.message,
		});
	}
});

router.get("/courses/all", async (req, res) => {
	try {
		const courses = await Course.find({});
		if (courses.length === 0) {
			throw new Error({ message: "Courses not found" });
		}
		courses.sort((a, b) => (a.name < b.name ? -1 : 1));
		for (let i = 0; i < courses.length; i++) {
			await courses[i].populate({
				path: "students.studentId",
			});
		}
		res.send(courses);
	} catch (err) {
		res.send(err.message);
	}
});

router.delete("/courses/delete/:id", professorAuth, async (req, res) => {
	const _id = req.params.id;
	// try {
	// 	const course = await Course.findByIdAndRemove(_id);
	// 	if (!course)
	// 		throw new Error({
	// 			status: 404,
	// 			message: "Course not found",
	// 		});

	// 	res.send();
	// } catch (err) {
	// 	res.send(err);
	// }
	try {
		const course = await Course.findById(_id);
		if (!course)
			throw new Error({
				status: 404,
				message: "Course not found",
			});
		res.send(await course.deleteCourse());
	} catch (err) {
		res.send(err.message);
	}
});
router.get("/courses/get-course/:id", async (req, res) => {
	const _id = req.params.id;
	try {
		const course = await Course.findById(_id);

		if (!course) {
			throw new Error({
				status: 404,
				message: "Course not found",
			});
		}
		await course.populate({
			path: "students.studentId",
		});
		console.log(course);
		res.send(course);
	} catch (err) {
		res.send(err);
	}
});
router.patch(
	"/courses/:courseId/add-student/:studentId",
	professorAuth,
	async (req, res) => {
		const _id = req.params.courseId;
		const studentId = req.params.studentId;
		try {
			const course = await Course.findById(_id);
			if (!course)
				throw new Error({
					status: 404,
					message: "Course not found",
				});
			const student = await Student.findById(studentId);
			if (!student)
				throw new Error({
					status: 404,
					message: "Student not found",
				});

			for (let i = 0; i < course.students.length; i++) {
				if (course.students[i].studentId.toString() === studentId)
					throw new Error("This student is already signed to the course");
			}
			const courseId = _id;
			course.students.push({ studentId });
			student.courses.push({ courseId });
			await course.save();
			await student.save();
			res.send(course);
		} catch (err) {
			res.send(err.message);
		}
	}
);
router.patch(
	"/courses/:courseId/delete-student/:studentId",
	professorAuth,
	async (req, res) => {
		const _id = req.params.courseId;
		const studentId = req.params.studentId;
		try {
			const course = await Course.findById(_id);
			res.send(await course.deleteStudent(studentId));
		} catch (err) {
			res.send(err);
		}
	}
);

router.patch(
	"/courses/:courseId/delete-all-students",
	professorAuth,
	async (req, res) => {
		const _id = req.params.courseId;
		try {
			const course = await Course.findById(_id);
			if (!course)
				throw new Error({
					status: 404,
					message: "Course not found",
				});
			// console.log(course.students);
			for (let i = 0; i < course.students.length; i++) {
				const student = await Student.findById(course.students[i].studentId);
				// console.log(student);
				for (let j = 0; j < student.courses.length; j++) {
					if (student.courses[j].courseId._id.toString() === _id) {
						student.courses.splice(j, 1);
					}
				}
				await student.save();
			}

			course.students = [];
			await course.save();

			console.log(course.students);
			res.send(course);
		} catch (err) {
			res.send(err.message);
		}
	}
);

router.get(
	"/courses/:courseId/all-available-students",
	professorAuth,
	async (req, res) => {
		const _id = req.params.courseId;
		try {
			const course = await Course.findById(_id);
			if (!course)
				throw new Error({
					status: 404,
					message: "Course not found",
				});
			const availableStudents = await Student.find({
				"courses.courseId": { $ne: { _id: _id } },
			});

			res.send(availableStudents);
		} catch (err) {
			res.send(err);
		}
	}
);

module.exports = router;
