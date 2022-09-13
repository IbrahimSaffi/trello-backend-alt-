const express = require('express')
const taskModel = require('../models/task-model')
const userModel = require('../models/user-model')
const router = express.Router()
const multer = require('multer')
const { findById, findOneAndUpdate } = require('../models/user-model')
const ObjectId = require('mongodb').ObjectId


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
        .populate('members',"name")
    res.status(200).json({data: tasks})
})


//create new task
router.post('/add', upload.single('image'), async (req, res) => {
    console.log(req.body)
    const { title, description, owner,label } = req.body
    if (!title || !description || !owner || !label) return res.status(400).json({ error: 'All filed is required' })
    //Left this code commented for extra functionality later
    // const validateAssignedTo = await userModel.findOne({ _id: assignedTo })
    // if (validateAssignedTo.length === 0) return res.status(400).json({ error: 'Assigned to User not found' })

    // let imageUrl = ''
    // if (req.file !== undefined) {
    //     imageUrl = process.env.BASE_URL + 'uploads/' + req.file.filename
    // }
    const newTask = new taskModel({ title, description, owner, labels:label })
    try {
        const savedTask = await newTask.save()
        // const updatedAssignedToUser = await userModel.updateOne({ _id: assignedTo },
            // { $push: { assignedTask: savedTask.id } })
        // const updateOwnedUser = await userModel.updateOne({ _id: req.payload._id },
            // { $push: { ownedTask: savedTask.id } })
            await taskModel.findOneAndUpdate({_id:ObjectId(newTask._id)},{ $push: { members: req.body.members } })
        res.status(201).json({ alert: "Task created with id: " + savedTask.id })
    } catch (e) {
        res.status(501).json({ error: e.message })
    }
})


// Get all user info
router.get('/get-all-user', async (req, res) => {
    const users = await userModel.find({}, {password: 0},{email:0})
    return res.status(200).json({ data: users })
})
router.post('/update/:id',async(req,res)=>{
    let task =await taskModel.findOne({_id:ObjectId(req.params.id)})
    console.log(req.params.id)
    console.log(task)
    const {status} = req.body
    console.log(status)
    if(!status){
        return res.status(400).json({error:"No updated status given"})
    }
    await taskModel.findOneAndUpdate({_id:ObjectId(req.params.id)},{status:status})
})

module.exports = router