require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const authRouter = require('./routes/auth-route')
const tasksRouter = require('./routes/tasks-route')
const app = express()
const cors = require('cors')
const jwt = require('jsonwebtoken')
const morgan = require('morgan')


app.use(cors({origin:"*"}))
app.use(express.urlencoded({ extended: true }))

mongoose.connect('mongodb+srv://IbrahimSaffi:jmk161651@tasks.tyvtipn.mongodb.net/?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log("Connected to DB"))
    .catch((err) => console.error("Error", err))


app.use(express.static('public'))
app.use(express.json())
app.use(morgan('dev'))


app.use('/auth', authRouter)
app.use(authenticateRequest)
app.use('/tasks', tasksRouter)


app.listen(process.env.PORT || 8000)


function authenticateRequest(req, res, next) {
    const authHeaderInfo = req.headers['authorization']

    if (authHeaderInfo === undefined) {
        res.status(401).json({ error: "No Token was Provided" })
    }

    const token = authHeaderInfo.split(" ")[1]
    if (token === undefined) {
        res.status(401).json({ error: "Proper token was not Provided" })
    }
    try {
        const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        req.payload = payload
        next()
    } catch (error) {
        console.log(error.message)
        res.status(401).json({ error: "Invalid access token Provided " + error.message })
    }
}