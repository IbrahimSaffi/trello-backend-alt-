const express = require('express')
const taskModel = require('../models/task-model')
const userModel = require('../models/user-model')
const router = express.Router()
const multer = require('multer')


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname)
    }
})

const upload = multer({ storage: storage })


//Get all tasks
router.get('/', async (req, res) => {
    const tasks = await taskModel.find({})
        .populate('owner', 'name')
        .populate('assignedTo', 'name')
    res.status(200).json({data: tasks})
})


//create new task
router.post('/add', upload.single('image'), async (req, res) => {
    const { title, description, owner, assignedTo, dueDate, labels } = req.body
    if (!title || !description || !owner || !assignedTo || !dueDate || !labels) return res.status(400).json({ error: 'All filed is required' })
    
    const validateAssignedTo = await userModel.findOne({ _id: assignedTo })
    if (validateAssignedTo.length === 0) return res.status(400).json({ error: 'Assigned to User not found' })

    let imageUrl = ''
    if (req.file !== undefined) {
        imageUrl = process.env.BASE_URL + 'uploads/' + req.file.filename
    }
    const newTask = new taskModel({ title, description, owner, assignedTo, dueDate, labels, imageUrl })
    try {
        const savedTask = await newTask.save()
        const updatedAssignedToUser = await userModel.updateOne({ _id: assignedTo },
            { $push: { assignedTask: savedTask.id } })
        const updateOwenedUser = await userModel.updateOne({ _id: req.payload._id },
            { $push: { ownedTask: savedTask.id } })
        res.status(201).json({ alert: "Task created with id: " + savedTask.id })
    } catch (e) {
        res.status(501).json({ error: e.message })
    }
})


// Get all user info
router.get('/get-all-user', async (req, res) => {
    const users = await userModel.find({}, {password: 0})
    res.status(200).json({ data: users })
})


module.exports = router