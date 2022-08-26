const mongoose = require('mongoose')

const taskSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
            // required: true
        },
        description: {
            type: String,
            required: true
        },
        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'
        },
        dueDate: {
            type: Date,
            required: true
        },
        labels: {
            type: String,
            required: true
        },
    }
)

const taskModel = mongoose.model("task", taskSchema)
module.exports = taskModel