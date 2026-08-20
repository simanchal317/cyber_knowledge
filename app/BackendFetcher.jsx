'use client';
import { useEffect } from 'react';

export default function BackendFetcher() {
  useEffect(() => {
    async function getData() {
      try {
        // Fetch from the local path so Next.js rewrites proxy it without CORS issues
        const response = await fetch('/api/data');
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();
        console.log("Backend response:", result);
      } catch (error) {
        console.error("Fetch error:", error);
      }
    }

    getData();
  }, []);

  return null;
}
