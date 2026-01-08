const jobService = require("../services/jobService");

/**
 * Search for jobs based on role and user skills
 */
exports.searchJobs = async (req, res) => {
  try {
    const { jobRole, location, page, userSkills } = req.body;

    if (!jobRole) {
      return res.status(400).json({
        success: false,
        error: "Job role is required",
      });
    }

    const result = await jobService.searchJobs({
      query: jobRole,
      location: location || "us",
      page: page || 1,
      resultsPerPage: 20,
      userSkills: userSkills || [],
    });

    res.json(result);
  } catch (error) {
    console.error("Error in searchJobs controller:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to search jobs",
    });
  }
};

/**
 * Get job details
 */
exports.getJobDetails = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { userSkills } = req.body;

    const result = await jobService.getJobDetails(jobId, userSkills);

    res.json(result);
  } catch (error) {
    console.error("Error in getJobDetails controller:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to get job details",
    });
  }
};
