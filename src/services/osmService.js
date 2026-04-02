import { request } from './api';

/**
 * Service xử lý các truy vấn liên quan đến bản đồ (Search và Direction)
 * Gọi trực tiếp thông qua Backend MapAI thay vì gọi trực tiếp OSM công cộng
 */

/**
 * Tìm kiếm địa điểm qua Backend MapAI
 * @param {string} query - Tên địa điểm cần tìm
 */
export const searchNominatim = async (query) => {
  try {
    const response = await request(`/map/search?q=${encodeURIComponent(query)}`);
    
    if (!response.ok) {
      throw new Error(`Search error: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (err) {
    console.error("Error searching through backend:", err);
    return [];
  }
};

/**
 * Lấy dữ liệu tuyến đường từ Backend MapAI
 * @param {Object} origin - {lat, lng}
 * @param {Object} destination - {lat, lng}
 * @param {string} mode - 'driving', 'bicycle', 'foot'
 */
export const fetchOSMRoute = async (origin, destination, mode = 'driving') => {
  try {
    const response = await request('/map/direction', {
      method: 'POST',
      body: JSON.stringify({
        startLat: origin.lat,
        startLng: origin.lng,
        endLat: destination.lat,
        endLng: destination.lng,
        mode: mode
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Không tìm thấy tuyến đường.');
    }
    
    // Backend trả về chuẩn GeoJSON của OSRM (đối tượng Route)
    return data;
  } catch (error) {
    console.error("Error fetching route from backend:", error);
    throw error;
  }
};
