import express from "express";
import {
  deleteUser,
  getUserListings,
  test,
  updateUser,
} from "../controllers/user.controllers.js";
import { verifyToken } from "../utils/veriftyUser.js";

const router = express.Router();

router.get("/test", test);
router.post("/update/:id", verifyToken, updateUser);
router.delete("/delete/:id", verifyToken, deleteUser);
router.get("/listings/:id", verifyToken, getUserListings);

export default router;
