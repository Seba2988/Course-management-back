const mongoose = require("mongoose");
const validator = require("validator");

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
		validate(value) {
			if (
				value.trim().length === 0 ||
				value.trim().toLowerCase() === "saturday"
			) {
				throw new Error("This day is not valid");
			}
		},
	},
	hour: {
		type: String,
		required: true,
		validate(value) {
			if (value.trim().length === 0) {
				throw new Error("This hour is not valid");
			}
		},
	},
	students: [
		{
			studentId: {
				type: mongoose.Types.ObjectId,
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

courseSchema.methods.toJSON = function () {
	const course = this;
	const courseObj = course.toObject();
	delete courseObj.__v;
	// for(let i=0;i<courseObj.students.length;i++){
	// 	delete courseObj.students[i].studentId
	// }
	return courseObj;
};

// courseSchema.virtual("students", {
// 	ref: "Student",
// 	localField: "_id",
// 	foreignField: "courses.course",
// });

const Course = mongoose.model("Course", courseSchema);
module.exports = Course;
