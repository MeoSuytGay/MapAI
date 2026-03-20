import { dragonBridgeMock } from "../mocks/dragonBridgeMock";

const SERPAPI_KEY = import.meta.env.VITE_SERIAPI_KEY;

/**
 * Fetches place details using SerpApi (Google Maps Search)
 * Note: In a production environment, this should be called from a backend
 * to avoid CORS issues and protect your API key.
 * @param {string} name - Name of the place
 * @param {Array} coordinates - [lng, lat]
 */
export const fetchPlaceDetails = async (name, coordinates) => {
  // Tạm thời tắt gọi API thực tế theo yêu cầu
  /*
  if (!SERPAPI_KEY || SERPAPI_KEY === 'YOUR_SERPAPI_KEY_HERE') {
    console.warn("SerpAPI Key is missing. Using mock data.");
    return getMockDetails(name);
  }
  ... logic fetch cũ ...
  */

  // Chỉ cho phép hiển thị thông tin nếu là Cầu Rồng
  const isCauRong = name.toLowerCase().includes("cầu rồng");
  
  return new Promise((resolve) => {
    setTimeout(() => {
      if (isCauRong) {
        resolve(getMockDetails(name));
      } else {
        // Trả về null cho các địa điểm khác
        resolve(null);
      }
    }, 500);
  });
};

const getMockDetails = (name) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const isCauRong = name.toLowerCase().includes("cầu rồng");

      if (isCauRong) {
        resolve({
          name: dragonBridgeMock.place_results.title,
          rating: 4.7,
          reviews: 28450,
          type: "Cầu phun lửa & nước",
          address: dragonBridgeMock.place_results.address,
          phone: "+84 236 123 456",
          website: "https://danang.gov.vn",
          description: "Cầu Rồng là một trong những biểu tượng hiện đại và rực rỡ nhất của Đà Nẵng. Con rồng thép khổng lồ này có khả năng phun lửa và nước vào mỗi tối cuối tuần, tạo nên một màn trình diễn ánh sáng và kỹ thuật độc đáo thu hút hàng ngàn du khách.",
          thumbnail: dragonBridgeMock.place_results.thumbnail,
          // Extract all images from the photos array for the slideshow
          photos: dragonBridgeMock.photos.map(p => p.image),
          hours: {
            monday: "Mở cửa cả ngày",
            tuesday: "Mở cửa cả ngày",
            wednesday: "Mở cửa cả ngày",
            thursday: "Mở cửa cả ngày",
            friday: "Mở cửa cả ngày",
            saturday: "Mở cửa cả ngày (Phun lửa 21:00)",
            sunday: "Mở cửa cả ngày (Phun lửa 21:00)"
          }
        });
      } else {
        resolve({
          name: name,
          rating: 4.5,
          reviews: 120,
          type: "Địa điểm nổi bật",
          address: "Hải Châu, Đà Nẵng, Việt Nam",
          phone: "+84 236 123 456",
          website: "https://danang.gov.vn",
          description: "Đây là một địa điểm tuyệt đẹp tại trung tâm thành phố Đà Nẵng, thu hút nhiều khách du lịch và người dân địa phương.",
          thumbnail: "https://images.unsplash.com/photo-1559592442-7e18259f63cc?auto=format&fit=crop&q=80&w=800",
          photos: [
            "https://images.unsplash.com/photo-1559592442-7e18259f63cc?auto=format&fit=crop&q=80&w=800"
          ],
          hours: {
            monday: "Mở cửa cả ngày",
            tuesday: "Mở cửa cả ngày",
            wednesday: "Mở cửa cả ngày",
            thursday: "Mở cửa cả ngày",
            friday: "Mở cửa cả ngày",
            saturday: "Mở cửa cả ngày",
            sunday: "Mở cửa cả ngày"
          }
        });
      }
    }, 800);
  });
};

