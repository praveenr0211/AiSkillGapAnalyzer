import axios from "axios";

const API_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "/api"
    : process.env.REACT_APP_API_URL || "http://localhost:5000/api";
const AUTH_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "/auth"
    : process.env.REACT_APP_AUTH_URL || "http://localhost:5000/auth";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Get current user
 */
export const getCurrentUser = async () => {
  const response = await axios.get(`${AUTH_BASE_URL}/user`, {
    withCredentials: true,
  });
  return response.data;
};

/**
 * Logout user
 */
export const logout = async () => {
  const response = await axios.post(
    `${AUTH_BASE_URL}/logout`,
    {},
    {
      withCredentials: true,
    }
  );
  return response.data;
};

/**
 * Upload resume file
 */
export const uploadResume = async (file) => {
  const formData = new FormData();
  formData.append("resume", file);

  const response = await axios.post(`${API_BASE_URL}/upload`, formData, {
    withCredentials: true,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

/**
 * Analyze skills
 */
export const analyzeSkills = async (
  resumeText,
  jobRole = null,
  jobDescription = null
) => {
  const response = await api.post("/analyze", {
    resumeText,
    jobRole,
    jobDescription,
  });

  return response.data;
};

/**
 * Get user's analysis history
 */
export const getHistory = async () => {
  const response = await axios.get(`${API_BASE_URL}/history`, {
    withCredentials: true,
  });
  return response.data;
};

/**
 * Get specific analysis by ID
 */
export const getAnalysisById = async (id) => {
  const response = await axios.get(`${API_BASE_URL}/history/${id}`, {
    withCredentials: true,
  });
  return response.data;
};

/**
 * Delete analysis by ID
 */
export const deleteAnalysis = async (id) => {
  const response = await axios.delete(`${API_BASE_URL}/history/${id}`, {
    withCredentials: true,
  });
  return response.data;
};

/**
 * Compare multiple analyses
 */
export const compareAnalyses = async (analysisIds) => {
  const response = await axios.post(
    `${API_BASE_URL}/history/compare`,
    { ids: analysisIds },
    {
      withCredentials: true,
    }
  );
  return response.data;
};

/**
 * Get user's skill progress
 */
export const getProgress = async () => {
  const response = await axios.get(`${API_BASE_URL}/progress`, {
    withCredentials: true,
  });
  return response.data;
};

/**
 * Update skill progress
 */
export const updateProgress = async (skillName, status, notes = "") => {
  const response = await axios.post(
    `${API_BASE_URL}/progress/update`,
    { skill_name: skillName, status, notes },
    {
      withCredentials: true,
    }
  );
  return response.data;
};

/**
 * Get user achievements
 */
export const getAchievements = async () => {
  const response = await axios.get(`${API_BASE_URL}/progress/achievements`, {
    withCredentials: true,
  });
  return response.data;
};

/**
 * Get progress statistics
 */
export const getProgressStats = async () => {
  const response = await axios.get(`${API_BASE_URL}/progress/stats`, {
    withCredentials: true,
  });
  return response.data;
};

/**
 * Send chat message
 */
export const sendChatMessage = async (
  message,
  sessionId = null,
  contextData = null
) => {
  const response = await axios.post(
    `${API_BASE_URL}/chat/message`,
    { message, sessionId, contextData },
    {
      withCredentials: true,
    }
  );
  return response.data;
};

/**
 * Get chat sessions
 */
export const getChatSessions = async () => {
  const response = await axios.get(`${API_BASE_URL}/chat/sessions`, {
    withCredentials: true,
  });
  return response.data;
};

/**
 * Get chat history for a session
 */
export const getChatHistory = async (sessionId) => {
  const response = await axios.get(
    `${API_BASE_URL}/chat/history/${sessionId}`,
    {
      withCredentials: true,
    }
  );
  return response.data;
};

/**
 * Clear chat session
 */
export const clearChatSession = async (sessionId) => {
  const response = await axios.delete(
    `${API_BASE_URL}/chat/session/${sessionId}`,
    {
      withCredentials: true,
    }
  );
  return response.data;
};

/**
 * Get quick action suggestions
 */
export const getQuickActions = async (contextData = null) => {
  const params = contextData ? { contextData } : {};
  const response = await axios.get(`${API_BASE_URL}/chat/quick-actions`, {
    params,
    withCredentials: true,
  });
  return response.data;
};

/**
 * Get chat rate limit status
 */
export const getChatRateLimit = async () => {
  const response = await axios.get(`${API_BASE_URL}/chat/rate-limit`, {
    withCredentials: true,
  });
  return response.data;
};

export default api;
