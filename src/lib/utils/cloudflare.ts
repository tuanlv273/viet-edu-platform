// src/lib/utils/cloudflare.ts
// Utility functions for Cloudflare integration
// Note: This file is kept for backward compatibility but not used in MySQL version

export function getCloudflareContext() {
  // Return a mock environment for non-Cloudflare environments
  return {
    env: {
      DB: null
    }
  };
}
