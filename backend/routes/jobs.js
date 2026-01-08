const express = require("express");
const router = express.Router();
const jobsController = require("../controllers/jobsController");
const { isAuthenticated } = require("../middleware/auth");

// Search jobs
router.post("/search", isAuthenticated, jobsController.searchJobs);

// Get job details
router.post("/:jobId/details", isAuthenticated, jobsController.getJobDetails);

module.exports = router;
