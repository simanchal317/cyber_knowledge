'use client';
import { useEffect } from 'react';

export default function BackendFetcher() {
  useEffect(() => {
    let API_URL = process.env.NEXT_PUBLIC_API_URL;

    async function getData() {
      try {
        // Strip trailing slash if present
        const baseUrl = API_URL.replace(/\/$/, '');
        const response = await fetch(`${baseUrl}/api/data`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();
        console.log("Backend response:", result);
      } catch (error) {
        console.error("Fetch error:", error);
      }
    }

    if (API_URL) getData();
  }, []);

  return null;
}
