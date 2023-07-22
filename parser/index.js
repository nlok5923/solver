const express = require('express');
const cors = require('cors');
const solveRoute = require('./routes/solveRoute')

const corsOptions = {
    origin:
     '*',
    credentials: true,
    optionSuccessStatus: 200,
  };

const app = express();
app.use(express.json());
app.use(cors(corsOptions));

app.use('/solve', solveRoute)

app.listen("81", (req, res) => {
    console.log("Listening your req...");
});