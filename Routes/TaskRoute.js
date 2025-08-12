const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const TaskController = require("../Controller/TaskCtrl");
const upload = require("../config/multer");

const uploadFields = upload.fields([
  { name: "image", maxCount: 1 },
  { name: "downloadFormUrl", maxCount: 1000 },
  { name: "sampleFormUrl", maxCount: 1000 },
]);

// Create a new task
router.post("/", uploadFields, TaskController.createTask);

// Get all tasks
router.get("/", TaskController.getAllTasks);

// Get a task by ID
router.get("/:id", TaskController.getTaskById);

// Update a task by ID
// router.put("/:id", TaskController.updateTask);
router.put("/:id", uploadFields, TaskController.updateTask);

// Delete a task by ID
router.delete("/delete/:id", TaskController.deleteTask);

module.exports = router;
