import express from 'express'
import { getAllUsers, getUserById, loginUser, myProfile, updateName, verifyUser } from '../controllers/userController.js'
import { isAuth } from '../middlewares/isAuth.js'
const router = express.Router()


router.post("/login", loginUser)
router.post("/verify", verifyUser)

router.get("/me", isAuth, myProfile)
router.post("/update/user", isAuth, updateName)

router.get("/user/all", isAuth, getAllUsers)
router.get("/user/:Id", getUserById)


export default router