const res = require("express/lib/response");
const mongoose = require("mongoose");
const validator = require("validator");
const Student = require("./studentModel");

const courseSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		trim: true,
		unique: true,
		lowercase: true,
		validate(value) {
			if (value.trim().length === 0) {
				throw new Error("This name is not valid");
			}
		},
	},
	startingDate: {
		type: Date,
		required: true,
	},
	endingDate: {
		type: Date,
		required: true,
		validate: [dateValidator],
	},
	day: {
		type: String,
		required: true,
		lowercase: true,
		validate: [dayValidator],
		// validate(value) {
		// 	if (
		// 		value.trim().length === 0 ||
		// 		value.trim().toLowerCase() === "saturday"
		// 	) {
		// 		throw new Error("This day is not valid");
		// 	}
		// },
	},
	hour: {
		type: String,
		required: true,
		validate: [hourValidator],
		// validate(value) {
		// 	if (value.trim().length === 0) {
		// 		throw new Error("This hour is not valid");
		// 	}
		// },
	},
	students: [
		{
			studentId: {
				type: mongoose.Schema.Types.ObjectId,
				ref: "Student",
			},
			attendance: [
				{
					date: {
						type: Date,
						required: true,
					},
					attended: {
						type: Boolean,
						default: false,
					},
				},
			],
		},
	],
});

function dateValidator(date) {
	return this.startingDate <= date;
}

function dayValidator(day) {
	const dayToCheck = day.trim().toLowerCase();
	switch (dayToCheck) {
		case "sunday":
		case "monday":
		case "tuesday":
		case "wednesday":
		case "thursday":
		case "friday":
			return true;
		default:
			return false;
	}
}

function hourValidator(hour) {
	const hourToCheck = hour.trim().toLowerCase();
	const hourPattern = new RegExp(/^([8-9]|0[8-9]|1[0-9]|2[0]):([0-5]?[0-9])$/);
	return hourPattern.test(hourToCheck);
}

courseSchema.methods.toJSON = function () {
	const course = this;
	const courseObj = course.toObject();
	delete courseObj.__v;
	// for (let i = 0; i < courseObj.students.length; i++) {
	// 	delete courseObj.students[i].studentId;
	// }
	return courseObj;
};

courseSchema.methods.deleteStudent = async function (studentId) {
	const course = this;
	if (!course) throw new Error({ message: "Course not found" });
	const student = await Student.findById(studentId);
	if (!student) throw new Error({ message: "Student not found" });
	try {
		course.students = course.students.filter(
			(student) => student.studentId.toString() !== studentId
		);
		student.courses = student.courses.filter(
			(courseToCheck) =>
				courseToCheck.courseId._id.toString() !== course._id.toString()
		);
		await student.save();
		await course.save();
		return course;
	} catch (err) {
		return err.message;
	}
};

courseSchema.methods.deleteCourse = async function () {
	const course = this;
	if (!course) throw new Error({ message: "Course not found" });
	try {
		for (let i = 0; i < course.students.length; i++) {
			const student = await Student.findById(course.students[i].studentId._id);
			student.courses = student.courses.filter(
				(courseToCheck) =>
					courseToCheck.courseId._id.toString() !== course._id.toString()
			);
			await student.save();
		}
		await Course.deleteOne({ _id: this._id });
		res.send();
	} catch (err) {
		return err;
	}
};

const Course = mongoose.model("Course", courseSchema);
module.exports = Course;
