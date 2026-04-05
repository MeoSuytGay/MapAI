import { request } from './api';

/**
 * LocationService - Quản lý danh sách và chi tiết các địa điểm từ database
 */

/**
 * 1. Lấy danh sách tất cả các địa điểm
 * @returns {Promise<Array>} Danh sách địa điểm
 */
export const getAllLocations = async () => {
  try {
    const response = await request('/location');
    
    if (!response.ok) {
      throw new Error(`Error fetching locations: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Mapping dữ liệu từ Backend sang format FE đang dùng
    return data.map(loc => ({
      id: loc.id,
      name: loc.title,
      address: loc.address,
      lat: loc.latitude,
      lng: loc.longitude,
      image: loc.thumbnail,
      rating: loc.rating,
      type: loc.category,
      tags: typeof loc.tags === 'string' 
        ? loc.tags.replace(/[{}]/g, '').split(',') 
        : (Array.isArray(loc.tags) ? loc.tags : []),
      distance: "Đang tính...", // Sẽ tính toán dựa trên vị trí người dùng nếu cần
      isFeatured: loc.rating >= 4.7
    }));
  } catch (error) {
    console.error("Error in getAllLocations:", error);
    return [];
  }
};

/**
 * 2. Lấy chi tiết một địa điểm theo ID
 * @param {string} id - ID của địa điểm
 * @returns {Promise<Object>} Chi tiết địa điểm
 */
export const getLocationById = async (id) => {
  try {
    const response = await request(`/location/${id}`);
    
    if (!response.ok) {
      throw new Error(`Error fetching location detail: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Mapping dữ liệu chi tiết
    return {
      ...data,
      name: data.title,
      lat: data.latitude,
      lng: data.longitude,
      image: data.thumbnail,
      tags: typeof data.tags === 'string' 
        ? data.tags.replace(/[{}]/g, '').split(',') 
        : (Array.isArray(data.tags) ? data.tags : [])
    };
  } catch (error) {
    console.error(`Error in getLocationById for id ${id}:`, error);
    return null;
  }
};
