const mongoose = require('mongoose')

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        password: {
            type: String,
            required: true
        },
        ownedTask: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'task'
        }],
        assignedTask: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'task'
        }],
        date: {
            type: Date,
            default: Date.now
        },
    }
)

const userModel = mongoose.model("user", userSchema)
module.exports = userModel