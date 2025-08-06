import axios from '@/plugins/axios';

export const useAdminUserApi = () => {
  const createUser = async (userData) => {
    try {
      const response = await axios.post('/api/admin/users', userData);
      return response.data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  };

  const getUserById = async (userId) => {
    try {
      const response = await axios.get(`/api/admin/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching user with ID ${userId}:`, error);
      throw error;
    }
  };

  const getAllUsers = async () => {
    try {
      const response = await axios.get('/api/admin/users');
      return response.data;
    } catch (error) {
      console.error('Error fetching all users:', error);
      throw error;
    }
  };

  const updateUser = async (userId, userData) => {
    try {
      const response = await axios.put(`/api/admin/users/${userId}`, userData);
      return response.data;
    } catch (error) {
      console.error(`Error updating user with ID ${userId}:`, error);
      throw error;
    }
  };

  const deleteUser = async (userId) => {
    try {
      await axios.delete(`/api/admin/users/${userId}`);
    } catch (error) {
      console.error(`Error deleting user with ID ${userId}:`, error);
      throw error;
    }
  };

  return {
    createUser,
    getUserById,
    getAllUsers,
    updateUser,
    deleteUser,
  };
};
