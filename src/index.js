const express = require("express");
const cors = require("cors");
const path = require("path");
const port = process.env.port;
require("./db/mongoose");

const publicDirectoryPath = path.join(__dirname, "../public");

const app = express();

app.use(cors());
app.use(express.static(publicDirectoryPath));
app.use(express.json());

app.listen(port, () => {
	console.log("Server connected, port: ", port);
});
