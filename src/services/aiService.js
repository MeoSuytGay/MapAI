import * as prompts from '../prompts/mapAssistantPrompt';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
// Sử dụng model gemini-1.5-flash cho ổn định (hoặc 2.0-flash nếu bạn chắc chắn API key hỗ trợ)
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

/**
 * Gọi Gemini API tổng quát
 */
const callGemini = async (systemPrompt, schema, userMessage) => {
  const requestBody = {
    contents: [{ role: 'user', parts: [{ text: userMessage }] }],
    system_instruction: { parts: [{ text: systemPrompt }] },
    generationConfig: {
      response_mime_type: "application/json",
      response_schema: schema
    }
  };

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || "Lỗi khi gọi Gemini API");
  }

  const data = await response.json();
  const text = data.candidates[0].content.parts[0].text;
  return JSON.parse(text);
};

/**
 * Tìm kiếm địa điểm qua Nominatim
 */
const searchNominatim = async (query) => {
  try {
    // Khung tọa độ Đà Nẵng (xấp xỉ): 107.81, 16.22 (Tây Bắc) và 108.49, 15.88 (Đông Nam)
    const viewbox = '107.81,16.22,108.49,15.88';
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=3&addressdetails=1&viewbox=${viewbox}&bounded=1&countrycodes=vn`
    );
    if (!response.ok) return [];
    return await response.json();
  } catch (err) {
    console.error("Nominatim error:", err);
    return [];
  }
};

/**
 * HÀM CHÍNH: Xử lý yêu cầu người dùng qua các tầng AI
 */
export const askMapAI = async (userInput, chatHistory = []) => {
  if (!GEMINI_API_KEY) {
    throw new Error("Chưa cấu hình Gemini API Key");
  }

  try {
    // TẦNG 1: ROUTER - Phân loại ý định
    const route = await callGemini(
      prompts.ROUTER_SYSTEM_PROMPT, 
      prompts.ROUTER_SCHEMA, 
      userInput
    );
    
    console.log("AI Route Decision:", route);

    // XỬ LÝ THEO PHÂN LOẠI
    
    // 1. Trường hợp Lỗi / Không liên quan
    if (route.category === 'error') {
      return {
        message: "Bạn đang hỏi câu không liên quan. Vui lòng hỏi câu khác.",
        suggestions: ["Tìm Cầu Rồng", "Chỉ đường tới Bà Nà Hills", "Xem bản đồ 3D"]
      };
    }

    // 2. Trường hợp Hỏi thông tin chi tiết (Place Detail)
    if (route.category === 'place_detail') {
      return await callGemini(
        prompts.PLACE_DETAIL_SYSTEM_PROMPT, 
        prompts.PLACE_DETAIL_SCHEMA, 
        userInput
      );
    }

    // 3. Trường hợp Ra lệnh cho Map (Action Map)
    if (route.category === 'action_map') {
      const type = route.action_type;

      // Chuyển 2D/3D
      if (type === '2D' || type === '3D') {
        return {
          message: `Dạ, em đang chuyển bản đồ sang chế độ ${type} cho mình đây ạ!`,
          action: { type: 'SWITCH_VIEW', value: type },
          suggestions: ["Tìm địa điểm gần đây", "Xem thông tin Cầu Rồng"]
        };
      }

      // Tìm vị trí (Location)
      if (type === 'Location') {
        const query = route.target_location || userInput;
        const results = await searchNominatim(query);

        if (results.length === 0) {
          return { 
            message: "Em không tìm thấy địa điểm này trên bản đồ. Bạn thử tên khác nhé!", 
            suggestions: ["Tìm Chợ Cồn", "Tìm Cầu Sông Hàn"] 
          };
        }

        // AI chọn kết quả đúng nhất từ 3 cái của Nominatim
        const context = `Người dùng tìm: "${query}". \nDanh sách kết quả: ${JSON.stringify(results.map((r, i) => ({ index: i, name: r.display_name })))}`;
        const picker = await callGemini(
          prompts.LOCATION_PICKER_SYSTEM_PROMPT, 
          prompts.LOCATION_PICKER_SCHEMA, 
          context
        );
        
        const bestMatch = results[picker.selected_index] || results[0];

        return {
          message: `Đây là vị trí của **${bestMatch.display_name}** mà bạn đang tìm ạ!`,
          location: {
            name: bestMatch.display_name,
            lat: parseFloat(bestMatch.lat),
            lng: parseFloat(bestMatch.lon),
            address: bestMatch.display_name
          },
          action: { type: 'FLY_TO', value: { lat: parseFloat(bestMatch.lat), lng: parseFloat(bestMatch.lon) } },
          suggestions: [`Chỉ đường tới đây`, `Thông tin về nơi này`]
        };
      }

      // Chỉ đường (Direction)
      if (type === 'Direction') {
        return {
          message: `Dạ, em đã chuẩn bị tuyến đường tới **${route.target_location}** cho mình rồi ạ. Bạn nhấn 'Bắt đầu' để đi nhé!`,
          action: { type: 'SET_DIRECTION', destination: route.target_location },
          suggestions: ["Chọn phương tiện đi lại", "Xem địa điểm dọc đường"]
        };
      }
    }

    return { 
      message: "Xin lỗi, em gặp chút trục trặc khi xử lý yêu cầu.", 
      suggestions: ["Thử lại", "Hỏi về Đà Nẵng"] 
    };

  } catch (error) {
    console.error("AI Service Error:", error);
    throw error;
  }
};
