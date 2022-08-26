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


router.get('/get-all-user', async (req, res) => {
    const users = await userModel.find({}, {password: 0})
    res.status(200).json({ data: users })
})



// //Delete specific ad
// router.delete('/delete/:id', async (req, res) => {
//     try {
//         const deleteAd = await AdModel.deleteOne({ _id: req.params.id })
//         res.status(202).send("Ad is deleted")
//     } catch (e) {
//         res.status(501).send(e.message)
//     }
// })


// //Get interested ads
// router.get('/get-interested-ads', async (req, res) => {
//     console.log(req.payload, 'PAYLOAD')
//     try {
//         const existingUser = await UserModel.findOne({ _id: req.payload._id })
//         if (existingUser === null) return res.status(400).send('User not found')
//         res.status(200).send(existingUser.interestedAds)
//     } catch (e) {
//         res.status(501).send(e.message)
//     }
// })


// //Get specific ad
// router.get('/:id', async (req, res) => {
//     try {
//         const getAd = await AdModel.findOne({ _id: req.params.id })
//         res.status(200).send(getAd)
//     } catch (e) {
//         res.status(501).send(e.message)
//     }
// })


// //Add interested buyers
// router.get('/add-to-interest/:adid', async (req, res) => {
//     try {
//         const getAd = await AdModel.updateOne({ _id: req.params.adid },
//             { $push: { interestedBuyers: req.payload._id } })
//         const getUser = await UserModel.updateOne({ _id: req.payload._id },
//             { $push: { interestedAds: req.params.adid } })
//         res.status(200).send("Interested buyers added")
//     } catch (e) {
//         res.status(501).send(e.message)
//     }
// })


// //Remove interested buyers
// router.get('/remove-from-interest/:adid', async (req, res) => {
//     try {
//         const getAd = await AdModel.updateOne({ _id: req.params.adid },
//             { $pull: { interestedBuyers: req.payload._id } })
//         const getUser = await UserModel.updateOne({ _id: req.payload._id },
//             { $pull: { interestedAds: req.params.adid } })
//         res.status(200).send("Interested buyers removed")
//     } catch (e) {
//         res.status(501).send(e.message)
//     }
// })




// //Close an ad
// router.get('/:id/close/:buyerid', async (req, res) => {
//     try {
//         const getAd = await AdModel.updateOne({ _id: req.params.id },
//             {
//                 buyer: req.params.buyerid,
//                 active: false,
//                 closeDate: Date.now()
//             })
//         res.status(200).send("Ad closed")
//     } catch (e) {
//         res.status(501).send(e.message)
//     }
// })


// router.get('/profile/:userid', async (req, res) => {
//     const user = await UserModel.findOne({ _id: req.params.userid })
//     if (user === null) return res.status(400).send('User not found')
//     const payload = { _id: user._id, name: user.name }
//     return res.status(200).send(payload)
// })


module.exports = router