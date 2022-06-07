const Student = require("../models/studentModel");

const getAllStudents = async () => {
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
		return students;
	} catch (err) {
		return err;
	}
};

module.exports = { getAllStudents };
