import { request } from './api';

/**
 * API User Profile
 */
export const userApi = {
  getProfile: async () => {
    const response = await request('/user/infor');
    if (!response.ok) throw new Error('Không thể lấy thông tin profile');
    return await response.json();
  },

  updateInfo: async (data) => {
    const response = await request('/user/update', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Cập nhật thông tin thất bại');
    }
    return await response.json();
  },

  updateAvatar: async (formData) => {
    const response = await request('/update-avatar', {
      method: 'POST',
      headers: {
        'Content-Type': undefined 
      },
      body: formData
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Cập nhật ảnh đại diện thất bại');
    }
    return await response.json();
  }
};
