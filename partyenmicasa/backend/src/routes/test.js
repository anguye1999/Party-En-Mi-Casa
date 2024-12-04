import express from "express";
const router = express.Router();
import authMiddleware from "../middleware/auth.js";

router.get("/test", async (req, res) => {
  return res.json({
    key: "value",
  });
});

router.get("/test-middleware", authMiddleware, async (req, res) => {
  return res.json({
    key: "value",
    isAuthenticated: true,
  });
});

export default router;
