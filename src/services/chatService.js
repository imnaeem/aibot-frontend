import { API_BASE_URL, ENDPOINTS } from "../utils/constants";
import { handleApiError } from "../utils/errorHandler";

// Send message to streaming endpoint
export const sendMessageStream = async (
  message,
  model = "llama-2-7b",
  documentContext = null
) => {
  try {
    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.CHAT_STREAM}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        model,
        stream: true,
        documentContext,
      }),
    });

    if (!response.ok) {
      const errorMessage = await handleApiError(response, "sendMessageStream");
      throw new Error(errorMessage);
    }

    return response;
  } catch (error) {
    console.error("Error in sendMessageStream:", error);
    throw error;
  }
};

// Send message to non-streaming endpoint
export const sendMessage = async (message, model = "llama-2-7b") => {
  try {
    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.CHAT}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        model,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorMessage = await handleApiError(response, "sendMessage");
      throw new Error(errorMessage);
    }

    return response.json();
  } catch (error) {
    console.error("Error in sendMessage:", error);
    throw error;
  }
};

// Get available models
export const getModels = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.MODELS}`);

    if (!response.ok) {
      const errorMessage = await handleApiError(response, "getModels");
      throw new Error(errorMessage);
    }

    return response.json();
  } catch (error) {
    console.error("Error in getModels:", error);
    throw error;
  }
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

export const uploadFile = async (file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorMessage = await handleApiError(response, "uploadFile");
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    console.error("Error in uploadFile:", error);
    throw error;
  }
};

export const getDocumentContent = async (documentId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/upload/content/${documentId}`);

    if (!response.ok) {
      const errorMessage = await handleApiError(response, "getDocumentContent");
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    console.error("Error in getDocumentContent:", error);
    throw error;
  }
};

// Process document (extract text from uploaded file)
export const processDocument = async (documentId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/upload/process/${documentId}`, {
      method: "POST",
    });

    if (!response.ok) {
      const errorMessage = await handleApiError(response, "processDocument");
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    console.error("Error in processDocument:", error);
    throw error;
  }
};

// Get unprocessed documents for a user
export const getUnprocessedDocuments = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/upload/unprocessed/${userId}`);

    if (!response.ok) {
      const errorMessage = await handleApiError(response, "getUnprocessedDocuments");
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    console.error("Error in getUnprocessedDocuments:", error);
    throw error;
  }
};
