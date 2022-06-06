const express = require("express");
const professorAuth = require("../middleware/professorAuth");
const Professor = require("../models/professorModel");

const router = new express.Router();

router.post("/professors/new", async (req, res) => {
	// const professor = new Professor(req.body);
	try {
		// await professor.save();
		const professor = await Professor.newProfessor(req.body);
		res.send({ professor });
	} catch (err) {
		res.status(400).send({
			status: 400,
			message: err.message,
		});
	}
});

router.patch("/professors/me", professorAuth, async (req, res) => {
	const validUpdates = [];
	for (let att in Professor.schema.obj) {
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
			req.professor[update] = req.body[update];
		}
		await req.professor.save();
		res.send(req.professor);
	} catch (err) {
		res.status(400).send({
			status: 400,
			message: err.message,
		});
	}
});

router.post("/professors/login", async (req, res) => {
	const email = req.body.email;
	const password = req.body.password;
	try {
		const professor = await Professor.findProfessorByEmailAndPassword(
			email,
			password
		);
		const token = await professor.generateAuthToken();
		res.send({ professor, token });
	} catch (err) {
		res.status(400).send({
			status: 400,
			message: err.message,
		});
	}
});

router.post("/professors/logout", professorAuth, async (req, res) => {
	try {
		req.professor.tokens = req.professor.tokens.filter(
			(tokenDoc) => tokenDoc.token !== req.token
		);
		await req.professor.save();
		res.send();
	} catch (err) {
		res.status(500).send(err);
	}
});

module.exports = router;
