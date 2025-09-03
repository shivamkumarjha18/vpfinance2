

require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const morgan = require("morgan");


// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("tiny"));


// Database Connection
mongoose
  .connect(process.env.dbUrl)
  .then(() => console.log(" DB connected"))
  .catch((err) => console.error(" DB Connection Error:", err));


// Import Routes
const LeadSourceRoute       = require("./Routes/Lead/LeadSourceRoute");
const LeadOccupationRoute   = require("./Routes/Lead/LeadOccupationRoute");
const LeadAreaRoute         = require("./Routes/Lead/LeadAreaRoute");
const LeadSubAreaRoute      = require("./Routes/Lead/LeadSubAreaRoute");
const LeadCityRoute         = require("./Routes/Lead/CityRoute");
const TaskRoute             = require("./Routes/TaskRoute");
const FinancialProductRoute = require("./Routes/FinancialProductRoute");
const CompanyNameRoute      = require("./Routes/CompanyNameRoute");
const RegistrarRoute        = require("./Routes/RegistrarRoute");
const AMCRoute              = require("./Routes/AMCRoute");
const LeadTypeRoute         = require("./Routes/LeadTypeRoute");
const OccupationTypeRoute   = require("./Routes/OccupationTypeRoute");
const OfficeDiaryRoute      = require("./Routes/OfficeDiaryRoute");
const OfficePurchaseRoute   = require("./Routes/OfficePurchaseRoute");
const ImpDocumentRoute      = require("./Routes/ImpDocumentRoute");
const ClientRoute           = require("./Routes/ClientRoute");
const SuspectRoute          = require("./Routes/SuspectRoute");
const ProspectRoute         = require("./Routes/ProspectRoute");

// Routes
app.use("/api",                     require("./Routes/upload"));
app.use("/api/Task",                TaskRoute);
app.use("/api/FinancialProduct",    FinancialProductRoute);
app.use("/api/CompanyName",         CompanyNameRoute);
app.use("/api/registrar",           RegistrarRoute);
app.use("/api/AMC",                 AMCRoute);
app.use("/api/office-diary",        OfficeDiaryRoute);
app.use("/api/office-purchase",     OfficePurchaseRoute);
app.use("/api/important-documents", ImpDocumentRoute);
app.use("/api/suspect",         SuspectRoute);
app.use("/api/prospect",        ProspectRoute);
app.use("/api/client",              ClientRoute);
app.use("/api/leadarea",            LeadAreaRoute);
app.use("/api/leadsubarea",         LeadSubAreaRoute);
app.use("/api/leadcity",            LeadCityRoute);
app.use("/api/leadType",            LeadTypeRoute);
app.use("/api/leadSource",          LeadSourceRoute);
app.use("/api/occupation/types",    OccupationTypeRoute);
app.use("/api/occupation",      LeadOccupationRoute);



// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error("Error:", err.stack);
  res.status(500).json({ 
    error: "Something went wrong!",
    message: process.env.NODE_ENV === "development" ? err.message : "Internal server error"
  });
});


// 404 Handler
app.use("*", (req, res) => {
  res.status(404).json({ 
    error: "Route not found",
    message: `The route ${req.originalUrl} does not exist`
  });
});


// Start Server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);

});