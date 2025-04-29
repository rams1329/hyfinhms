// backend/routes/degreeRoute.js
import express from "express";
import { 
  getAllDegrees, 
  getActiveDegrees, 
  addDegree, 
  updateDegree, 
  deleteDegree 
} from "../controllers/degreeController.js";
import authAdmin from "../middlewares/authAdmin.js";

const router = express.Router();

router.get("/all", getAllDegrees);
router.get("/active", getActiveDegrees);
router.post("/add", authAdmin, addDegree);
router.put("/update", authAdmin, updateDegree);
router.delete("/delete/:id", authAdmin, deleteDegree);

export default router;
