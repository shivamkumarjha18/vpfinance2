const mongoose = require("mongoose");
const TaskSchema = require("./TaskSchema");

// Model names and custom collection names
const CompositeTask = mongoose.model(
  "composite",
  TaskSchema,
  "composite_tasks"
);
const MarketingTask = mongoose.model(
  "marketing",
  TaskSchema,
  "marketing_tasks"
);
const ServiceTask = mongoose.model("service", TaskSchema, "service_tasks");
// mongoose.model(modelName, schema, collectionName);

module.exports = {
  CompositeTask,
  MarketingTask,
  ServiceTask,
};
