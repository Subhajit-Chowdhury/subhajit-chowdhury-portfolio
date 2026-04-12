/**
 * Utility to retrieve the Gemini API key from various environment sources.
 * Checks Vite-specific and process-level environment variables.
 */
export const getGeminiApiKey = (): string => {
  try {
    // @ts-ignore
    const viteKey = import.meta.env?.VITE_GEMINI_API_KEY;
    // @ts-ignore
    const viteKeyAlt = import.meta.env?.GEMINI_API_KEY;
    
    let processKey = "";
    try {
      // @ts-ignore
      processKey = (typeof process !== 'undefined' && (process.env?.VITE_GEMINI_API_KEY || process.env?.GEMINI_API_KEY)) || "";
    } catch (e) {
      // process might not be defined in some browser environments
    }

    const key = viteKey || viteKeyAlt || processKey || "";
    
    if (typeof key !== 'string') return "";
    
    const trimmedKey = key.trim();
    
    // Check if it's a placeholder
    if (trimmedKey === "your_api_key_here" || trimmedKey === "") {
      return "";
    }
    
    return trimmedKey;
  } catch (error) {
    console.error("Error retrieving API key:", error);
    return "";
  }
};
