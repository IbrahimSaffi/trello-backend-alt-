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
        active: {
            type: Boolean,
            default: false
        },
    },
    {timestamps : true}
)

const userModel = mongoose.model("user", userSchema)
module.exports = userModel