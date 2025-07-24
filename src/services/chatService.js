import { API_BASE_URL, ENDPOINTS } from "../utils/constants";

// Send message to streaming endpoint
export const sendMessageStream = async (message) => {
  const response = await fetch(`${API_BASE_URL}${ENDPOINTS.CHAT_STREAM}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message }),
  });

  if (!response.ok) {
    throw new Error("Failed to get response from server");
  }

  return response;
};

// Send message to non-streaming endpoint
export const sendMessage = async (message) => {
  const response = await fetch(`${API_BASE_URL}${ENDPOINTS.CHAT}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message }),
  });

  if (!response.ok) {
    throw new Error("Failed to get response from server");
  }

  return response.json();
};

// Get available models
export const getModels = async () => {
  const response = await fetch(`${API_BASE_URL}${ENDPOINTS.MODELS}`);

  if (!response.ok) {
    throw new Error("Failed to get models");
  }

  return response.json();
};

// Process streaming response
export const processStreamingResponse = async (
  response,
  onToken,
  onComplete,
  onError
) => {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop();

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6);
          if (data.trim()) {
            try {
              const parsed = JSON.parse(data);

              if (parsed.type === "token") {
                onToken(parsed.content);
              } else if (parsed.type === "done") {
                onComplete();
                return;
              }
            } catch (e) {
              console.error("Error parsing SSE data:", e);
            }
          }
        }
      }
    }
  } catch (error) {
    console.error("Error reading stream:", error);
    onError(error);
  }
};
