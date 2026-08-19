'use client';
import { useEffect } from 'react';

export default function BackendFetcher() {
  useEffect(() => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL;

    async function getData() {
      try {
        const response = await fetch(`${API_URL}/api/data`);
        const result = await response.json();
        console.log("Backend response:", result);
      } catch (error) {
        console.error("Fetch error:", error);
      }
    }

    if (API_URL) getData();
  }, []);

  return null; // Runs in background, adds nothing to the UI
}
