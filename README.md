# AI Bot - Multi-Model Chat Application

A modern AI chat application where you can select different AI models, chat with them, upload documents, and have context-aware conversations with your documents.

## Features

- 🤖 **Multiple AI Models**: Choose from various models including Llama, Mistral, CodeLama, Gemma, Phi-2, and more
- 💬 **Interactive Chat**: Real-time streaming responses from AI models
- 📄 **Document Processing**: Upload and chat with your documents for context-aware conversations
- 🔐 **Authentication**: Secure user authentication with Supabase
- 👤 **Guest Mode**: Try the app without signing up
- 💾 **Chat History**: Save and manage your conversations
- ⭐ **Favorites**: Mark important chats as favorites
- 🔍 **Search**: Quickly find past conversations
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

- **Frontend**: React 19
- **UI Framework**: Material-UI (MUI)
- **Backend**: Supabase (Database, Authentication, Storage)
- **AI Models**: Groq API, Ollama (Local), HuggingFace
- **Code Highlighting**: React Syntax Highlighter

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install` or `yarn install`
3. Set up environment variables (see below)
4. Run development server: `npm start`
5. Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

Create a `.env` file in the root directory with:

```env
REACT_APP_API_BASE_URL=your_backend_api_url
REACT_APP_SUPABASE_URL=your_supabase_project_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

## Supported AI Models

- **Llama 2** (7B, 13B) - General conversation and reasoning
- **Mistral 7B** - Fast and efficient multilingual model
- **Code Llama 7B** - Specialized for code generation and debugging
- **Gemma 2B** - Lightweight and fast Google model
- **Phi-2** - Microsoft's compact but powerful model
- **HuggingFace Free** - Free tier access to various models
- **Groq Llama** - Super fast inference with free tier

## License

MIT License - see LICENSE file for details

## Author

Muhammad Naeem
