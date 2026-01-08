import axios from "axios";

const API_URL =
    process.env.NODE_ENV === "production"
        ? "/admin"
        : process.env.REACT_APP_API_URL
            ? `${process.env.REACT_APP_API_URL}/admin`
            : "http://localhost:5000/admin";

// Admin login
export const adminLogin = async (email, password) => {
    const response = await axios.post(
        `${API_URL}/login`,
        { email, password },
        { withCredentials: true }
    );
    return response.data;
};

// Admin logout
export const adminLogout = async () => {
    const response = await axios.post(
        `${API_URL}/logout`,
        {},
        { withCredentials: true }
    );
    return response.data;
};

// Get current admin
export const getCurrentAdmin = async () => {
    const response = await axios.get(`${API_URL}/current`, {
        withCredentials: true,
    });
    return response.data;
};

// Get dashboard statistics
export const getAdminStats = async () => {
    const response = await axios.get(`${API_URL}/stats`, {
        withCredentials: true,
    });
    return response.data;
};

// Get users list
export const getUsers = async (page = 1, limit = 10, search = "") => {
    const response = await axios.get(`${API_URL}/users`, {
        params: { page, limit, search },
        withCredentials: true,
    });
    return response.data;
};

// Course Management
export const getAdminCourses = async () => {
    const response = await axios.get(`${API_URL}/courses`, {
        withCredentials: true,
    });
    return response.data;
};

export const addAdminCourse = async (courseData) => {
    const response = await axios.post(`${API_URL}/courses`, courseData, {
        withCredentials: true,
    });
    return response.data;
};

export const deleteAdminCourse = async (id) => {
    const response = await axios.delete(`${API_URL}/courses/${id}`, {
        withCredentials: true,
    });
    return response.data;
};
