export const SIDEBAR_WIDTH = 300;

export const STORAGE_KEY = "chatgpt-clone-chats";

export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export const ENDPOINTS = {
  CHAT_STREAM: "/chat/stream",
  CHAT: "/chat",
  MODELS: "/models",
};

export const KEYBOARD_SHORTCUTS = {
  SEARCH: "k",
  ESCAPE: "Escape",
  ENTER: "Enter",
};

export const CHAT_GROUPS = {
  FAVORITES: "Favorites",
  TODAY: "Today",
  YESTERDAY: "Yesterday",
  EARLIER: "Earlier",
};

export const MESSAGE_ROLES = {
  USER: "user",
  ASSISTANT: "assistant",
};

export const SCROLL_THRESHOLD = 100;
export const MAX_CODE_HEIGHT = 400;
export const MIN_LINES_FOR_LINE_NUMBERS = 5;

// AI Models Configuration
export const AI_MODELS = {
  "llama-2-7b": {
    id: "llama-2-7b",
    name: "Llama 2 7B",
    provider: "Ollama (Local)",
    description: "Free local model, great for general chat",
    capabilities: ["text", "conversation", "general"],
    speed: "medium",
    cost: "free",
    maxTokens: 4096,
    color: "#2563eb",
    icon: "🦙",
    popular: true,
    isFree: true,
    isLocal: true,
  },
  "llama-2-13b": {
    id: "llama-2-13b",
    name: "Llama 2 13B",
    provider: "Ollama (Local)",
    description: "Larger Llama model with better reasoning",
    capabilities: ["text", "analysis", "reasoning"],
    speed: "slow",
    cost: "free",
    maxTokens: 4096,
    color: "#2563eb",
    icon: "🦙",
    popular: false,
    isFree: true,
    isLocal: true,
  },
  "mistral-7b": {
    id: "mistral-7b",
    name: "Mistral 7B",
    provider: "Ollama (Local)",
    description: "Fast and efficient French-made model",
    capabilities: ["text", "code", "multilingual"],
    speed: "fast",
    cost: "free",
    maxTokens: 8192,
    color: "#ff6b35",
    icon: "🌪️",
    popular: true,
    isFree: true,
    isLocal: true,
  },
  "codellama-7b": {
    id: "codellama-7b",
    name: "Code Llama 7B",
    provider: "Ollama (Local)",
    description: "Specialized for code generation and debugging",
    capabilities: ["code", "programming", "debugging"],
    speed: "medium",
    cost: "free",
    maxTokens: 4096,
    color: "#059669",
    icon: "💻",
    popular: true,
    isFree: true,
    isLocal: true,
  },
  "gemma-2b": {
    id: "gemma-2b",
    name: "Gemma 2B",
    provider: "Ollama (Local)",
    description: "Lightweight Google model, very fast",
    capabilities: ["text", "conversation"],
    speed: "fast",
    cost: "free",
    maxTokens: 2048,
    color: "#4285f4",
    icon: "💎",
    popular: false,
    isFree: true,
    isLocal: true,
  },
  "phi-2": {
    id: "phi-2",
    name: "Phi-2",
    provider: "Ollama (Local)",
    description: "Microsoft's compact but powerful model",
    capabilities: ["text", "reasoning", "math"],
    speed: "fast",
    cost: "free",
    maxTokens: 2048,
    color: "#00bcf2",
    icon: "🧮",
    popular: false,
    isFree: true,
    isLocal: true,
  },
  "huggingface-free": {
    id: "huggingface-free",
    name: "HuggingFace Free",
    provider: "HuggingFace Inference",
    description: "Free tier access to various models",
    capabilities: ["text", "code", "general"],
    speed: "medium",
    cost: "free",
    maxTokens: 2048,
    color: "#ff9500",
    icon: "🤗",
    popular: true,
    isFree: true,
    isLocal: false,
  },
  "groq-llama": {
    id: "groq-llama",
    name: "Groq Llama",
    provider: "Groq (Free Tier)",
    description: "Super fast inference with free tier",
    capabilities: ["text", "conversation", "speed"],
    speed: "fast",
    cost: "free",
    maxTokens: 4096,
    color: "#f97316",
    icon: "⚡",
    popular: true,
    isFree: true,
    isLocal: false,
  },
};

export const DEFAULT_MODEL = "llama-2-7b";

export const MODEL_CATEGORIES = {
  POPULAR: "popular",
  ALL: "all",
  BY_SPEED: "speed",
  BY_COST: "cost",
};

// Speed indicators
export const SPEED_INDICATORS = {
  fast: { label: "Fast", color: "#4caf50", icon: "🚀" },
  medium: { label: "Medium", color: "#ff9800", icon: "⚡" },
  slow: { label: "Slow", color: "#f44336", icon: "🐌" },
};

// Cost indicators
export const COST_INDICATORS = {
  free: { label: "Free", color: "#4caf50", icon: "🆓" },
  low: { label: "Low Cost", color: "#4caf50", icon: "💚" },
  medium: { label: "Medium Cost", color: "#ff9800", icon: "💛" },
  high: { label: "High Cost", color: "#f44336", icon: "💸" },
};
