const getModelByType = require("../utils/GetModelByType"); // adjust the path if needed
const Financial = require("../Models/FinancialProductModel");

const path = require("path");

// // Create a new task
exports.createTask = async (req, res) => {
  console.log(req.body);
  try {
    const type = req.body.type;
    console.log(type, "type of the model");
    const TaskModel = getModelByType(type);
    // Clean field names (remove tab characters)
    const body = {};
    console.log("body data", body);

    for (let key in req.body) {
      body[key.trim()] = req.body[key];
    }

    // Handle files
    const image = req.files?.image?.[0]?.filename || "";
    // const downloadFormUrl = req.files?.downloadFormUrl?.[0]?.filename || "";
    // const sampleFormUrl = req.files?.sampleFormUrl?.[0]?.filename || "";
    let downloadFormFiles = req.files?.downloadFormUrl || [];
    let sampleFormFiles = req.files?.sampleFormUrl || [];

    // Prepare checklists array
    const checklists = Array.isArray(body.checklists)
      ? body.checklists
      : body.checklists
      ? [body.checklists]
      : [];

    // // Parse formChecklists (if JSON string)
    // let formChecklists = [];
    // if (body.formChecklists) {
    //   formChecklists = JSON.parse(body.formChecklists);
    //   if (formChecklists.length > 0) {
    //     formChecklists[0].downloadFormUrl = downloadFormUrl;
    //     formChecklists[0].sampleFormUrl = sampleFormUrl;
    //   }
    // }

    // Parse formChecklists
    let formChecklists = [];
    if (body.formChecklists) {
      formChecklists = JSON.parse(body.formChecklists);

      // Attach the files to each checklist object
      formChecklists = formChecklists.map((item, index) => {
        return {
          name: item.name,
          downloadFormUrl: downloadFormFiles[index]?.filename || "",
          sampleFormUrl: sampleFormFiles[index]?.filename || "",
        };
      });
    }

    const cats = await Financial.findOne({ _id: req.body.cat });

    // Create a new task document
    const newTask = new TaskModel({
      type,
      cat: cats.name,
      sub: body.sub,
      depart: body.depart,
      name: body.name,
      descp: {
        text: body.descpText,
        image: image,
      },
      email_descp: body.email_descp,
      sms_descp: body.sms_descp,
      whatsapp_descp: body.whatsapp_descp,
      checklists: checklists,
      formChecklists: formChecklists,
    });

    // Save to database
    await newTask.save();

    res.status(201).json({
      message: "Task created successfully",
      task: newTask,
    });
  } catch (err) {
    console.error("Error saving task:", err);
    res.status(500).json({
      message: "Failed to create task",
      error: err.message,
    });
  }
};

// Get all tasks
exports.getAllTasks = async (req, res) => {
  try {
    const type = req.query.type;
    console.log(type, "type of the model");
    // const { type } = req.query;
    const TaskModel = getModelByType(type);
    const tasks = await TaskModel.find().sort({ createdAt: -1 });
    res.status(200).json(tasks);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch tasks", error: err.message });
  }
};

exports.getTaskById = async (req, res) => {
  try {
    // ✅ Get task type from query parameter
    const type = req.query.type;
    console.log(type, "type of the model");
    // const { type } = req.query;

    // ✅ Get correct model based on type
    const TaskModel = getModelByType(type);
    const task = await TaskModel.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.status(200).json(task);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch task", error: err.message });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const type = req.body.type;
    console.log(type, "type of the model");
    const TaskModel = getModelByType(type);
    const id = req.params.id;
    const body = {};
    for (let key in req.body) {
      body[key.trim()] = req.body[key];
    }

    const updates = {
      cat: body.cat,
      sub: body.sub,
      depart: body.depart,
      name: body.name,
      email_descp: body.email_descp,
      sms_descp: body.sms_descp,
      whatsapp_descp: body.whatsapp_descp,
      checklists: Array.isArray(body.checklists)
        ? body.checklists
        : body.checklists
        ? [body.checklists]
        : [],
      descp: {
        text: body.descpText || "",
      },
    };

    // ✅ Handle optional image update
    if (req.files?.image?.[0]) {
      updates.descp.image = req.files.image[0].filename;
    }

    // ✅ Handle formChecklists update if provided
    if (body.formChecklists) {
      let parsed = [];
      try {
        parsed = JSON.parse(body.formChecklists);
        if (parsed.length > 0) {
          if (req.files?.downloadFormUrl?.[0]) {
            parsed[0].downloadFormUrl = req.files.downloadFormUrl[0].filename;
          }
          if (req.files?.sampleFormUrl?.[0]) {
            parsed[0].sampleFormUrl = req.files.sampleFormUrl[0].filename;
          }
        }
        updates.formChecklists = parsed;
      } catch (err) {
        return res
          .status(400)
          .json({ message: "Invalid formChecklists format" });
      }
    }

    console.log(updates, "wertyuio");

    const updated = await TaskModel.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.status(200).json({ message: "Task updated", task: updated });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ message: "Update failed", error: err.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const type = req.query.type;
    console.log(type, "type of the model");
    // const { type } = req.query;
    const TaskModel = getModelByType(type);

    // ✅ [3] Replaced hardcoded CompositeTask with dynamic model
    const deleted = await TaskModel.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Task not found" });
    res.status(200).json({ message: "Task deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed", error: err.message });
  }
};
