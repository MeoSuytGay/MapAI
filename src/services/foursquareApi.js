const FOURSQUARE_API_KEY = import.meta.env.VITE_FOURSQUARE_API_KEY;

// Kiểm tra xem API Key đã được load chưa
if (FOURSQUARE_API_KEY && FOURSQUARE_API_KEY !== 'your_foursquare_api_key_here') {
  console.log('Foursquare API v3 initialized with Key: ' + FOURSQUARE_API_KEY.substring(0, 4) + '...');
}

/**
 * Tìm kiếm các địa điểm lân cận (nearby) bằng Foursquare API v3
 * @param {number} lat - Vĩ độ
 * @param {number} lng - Kinh độ
 * @param {string} query - Từ khóa tìm kiếm (tùy chọn)
 * @param {number} radius - Bán kính tìm kiếm (m), mặc định 1000m
 * @returns {Promise<Array>} - Danh sách các địa điểm
 */
export const searchNearbyPlaces = async (lat, lng, query = '', radius = 1000) => {
  if (!FOURSQUARE_API_KEY || FOURSQUARE_API_KEY === 'your_foursquare_api_key_here') {
    const errorMsg = 'Foursquare API Key chưa được cấu hình trong file .env';
    console.warn(errorMsg);
    throw new Error(errorMsg);
  }

  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${FOURSQUARE_API_KEY}`, // Thêm Bearer prefix
      'X-Places-Api-Version': '2025-06-17' // Thêm version header
    }
  };

  const params = new URLSearchParams({
    ll: `${lat},${lng}`,
    radius: radius.toString(),
    limit: '10',
    sort: 'DISTANCE'
  });

  if (query) {
    params.append('query', query);
  }

  try {
    // Sử dụng URL trực tiếp
    const response = await fetch(`https://places-api.foursquare.com/places/search?${params.toString()}`, options);

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Xác thực thất bại (401): Vui lòng kiểm tra lại Bearer Token.');
      }
      throw new Error(`Foursquare API error: ${response.statusText}`);
    }


    const data = await response.json();
    return data.results.map(place => ({
      fsq_id: place.fsq_id,
      name: place.name,
      location: place.location,
      categories: place.categories,
      distance: place.distance,
      geocodes: place.geocodes,
      display_name: `${place.name}, ${place.location.formatted_address || place.location.address || ''}`,
      lat: place.geocodes.main.latitude,
      lng: place.geocodes.main.longitude,
      type: 'foursquare_place'
    }));
  } catch (error) {
    console.error('Error fetching nearby places from Foursquare:', error);
    return [];
  }
};
