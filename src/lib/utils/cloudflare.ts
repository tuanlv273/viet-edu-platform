// src/lib/utils/cloudflare.ts
// Tiện ích để lấy context Cloudflare

export function getCloudflareContext() {
  // Trong môi trường phát triển, context có thể được lấy từ biến toàn cục
  // Trong môi trường sản xuất, context sẽ được truyền vào từ Cloudflare Workers
  
  if (typeof globalThis.__CLOUDFLARE__ !== 'undefined') {
    return globalThis.__CLOUDFLARE__;
  }
  
  // Fallback cho môi trường phát triển
  return {
    env: {
      // Các biến môi trường mặc định
    },
    ctx: {
      // Context mặc định
    }
  };
}
