const express = require("express");
const cors = require("cors");
const path = require("path");
const port = process.env.port;
require("./db/mongoose");

const studentsRouter = require("./routers/studentsRouter");
const professorsRouter = require("./routers/professorsRouter");
const coursesRouter = require("./routers/coursesRouter");

const publicDirectoryPath = path.join(__dirname, "../public");

const app = express();

app.use(cors());
app.use(express.static(publicDirectoryPath));
app.use(express.json());
app.use(studentsRouter);
app.use(professorsRouter);
app.use(coursesRouter);

app.listen(port, () => {
	console.log("Server connected, port: ", port);
});
