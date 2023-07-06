const express = require('express');
const app = express();
const cookieParser = require("cookie-parser")
const env = require("dotenv")
env.config()

const indexRouter = require("./routes/index.js") //
const connect = require("./schemas/index.js")
connect()

app.use(express.json()) 
app.use(cookieParser())
app.use("", indexRouter) 



app.listen(process.env.PORT, () => {
    console.log(process.env.PORT, '포트로 서버가 열렸어요!');
  });