# AI Bot Frontend 🤖

A modern, feature-rich AI chatbot frontend application that supports multiple AI models and providers. Built with React and Material-UI, this application provides a seamless chat experience with various AI models including local Ollama models and cloud-based APIs.

## ✨ Features

### 🧠 Multi-Model AI Support
- **Local Models (via Ollama)**:
  - Llama 2 7B & 13B - General conversation and reasoning
  - Mistral 7B - Fast and efficient French-made model
  - Code Llama 7B - Specialized for code generation and debugging
  - Gemma 2B - Lightweight Google model, very fast
  - Phi-2 - Microsoft's compact but powerful model

- **Cloud-Based Models**:
  - HuggingFace Free Tier - Access to various models
  - Groq Llama - Super fast inference with free tier

### 💬 Chat Features
- **Real-time streaming responses** for natural conversation flow
- **Chat history management** with persistent storage
- **Guest mode** for quick access without registration
- **Multiple chat sessions** with easy switching
- **Message editing and resending**
- **Search and filter** through chat history
- **Keyboard shortcuts** for improved productivity

### 🔐 Authentication & User Management
- **Supabase authentication** with email/password
- **User profiles** with customizable settings
- **Session management** with automatic sign-in
- **Guest mode** for anonymous usage

### 📄 Document Processing
- **File upload support** for various document types
- **Document context integration** with chat responses
- **Document management** and organization
- **Content extraction** from uploaded files

### 🎨 User Interface
- **Material-UI design system** for modern, responsive interface
- **Dark/Light theme support** (configurable)
- **Responsive layout** that works on all screen sizes
- **Sidebar navigation** for easy chat management
- **Syntax highlighting** for code blocks
- **Real-time typing indicators**

### ⚡ Performance & UX
- **Optimized for performance** with React 19
- **Lazy loading** for better initial load times
- **Error handling** with user-friendly messages
- **Offline support** for basic functionality

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm/yarn
- A backend API server (for AI model inference)
- Supabase account (for authentication and database)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/imnaeem/aibot-frontend.git
   cd aibot-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   REACT_APP_API_BASE_URL=http://localhost:8000
   REACT_APP_SUPABASE_URL=your_supabase_url
   REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
   REACT_APP_URI=http://localhost:3000
   ```

4. **Start the development server**
   ```bash
   npm start
   # or
   yarn start
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Environment Configuration

### Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `REACT_APP_API_BASE_URL` | Backend API server URL | `http://localhost:8000` |
| `REACT_APP_SUPABASE_URL` | Supabase project URL | `https://your-project.supabase.co` |
| `REACT_APP_SUPABASE_ANON_KEY` | Supabase anonymous key | `eyJhbGciOiJIUzI1NiIsInR5cCI...` |
| `REACT_APP_URI` | Frontend application URL | `http://localhost:3000` |

### Backend API Requirements

The frontend expects a backend API with the following endpoints:
- `POST /chat/stream` - Streaming chat responses
- `POST /chat` - Non-streaming chat responses
- `GET /models` - Available AI models
- `POST /upload` - File upload for document processing
- `GET /upload/content/{id}` - Get document content
- `POST /upload/process/{id}` - Process uploaded document

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── Auth/           # Authentication components
│   ├── Chat/           # Chat interface components
│   ├── Layout/         # Layout components (header, sidebar)
│   ├── Sidebar/        # Chat history and navigation
│   └── shared/         # Reusable UI components
├── contexts/           # React contexts for state management
├── hooks/              # Custom React hooks
├── lib/                # External library configurations
├── services/           # API service functions
├── utils/              # Utility functions and constants
└── database/           # Database schema and migrations
```

## 🛠️ Available Scripts

### Development

```bash
# Start development server
npm start

# Run tests
npm test

# Run tests with coverage
npm test -- --coverage
```

### Production

```bash
# Build for production
npm run build

# Serve production build locally
npm install -g serve
serve -s build
```

### Code Quality

```bash
# Lint code
npm run lint

# Format code (if configured)
npm run format
```

## 🎯 Usage

### Basic Chat
1. Start the application and either sign in or use guest mode
2. Select an AI model from the dropdown menu
3. Type your message and press Enter or click Send
4. Enjoy real-time streaming responses

### Document Chat
1. Upload a document using the upload button
2. The document content will be processed and available as context
3. Ask questions about the uploaded document
4. The AI will respond using the document context

### Keyboard Shortcuts
- `Cmd/Ctrl + K` - Open search
- `Escape` - Close search/modal
- `Enter` - Send message (in input field)
- `Cmd/Ctrl + /` - Show keyboard shortcuts

### Model Selection
Each model has different strengths:
- **Llama 2 7B**: Best for general conversations
- **Code Llama 7B**: Optimal for programming tasks
- **Mistral 7B**: Fast responses with multilingual support
- **Groq Llama**: Fastest inference speed
- **HuggingFace Free**: Access to various specialized models

## 🔒 Database Schema

The application uses Supabase (PostgreSQL) with the following main tables:
- `users` - User profiles and authentication data
- `chats` - Chat conversations
- `messages` - Individual chat messages
- `documents` - Uploaded document metadata
- `folders` - Chat organization (optional)

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically on every push

### Netlify
1. Build the project: `npm run build`
2. Deploy the `build` folder to Netlify
3. Configure environment variables
4. Set up continuous deployment

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npx", "serve", "-s", "build", "-l", "3000"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- 📧 Email: support@example.com
- 💬 Discord: [Join our community](https://discord.gg/example)
- 📖 Documentation: [Full documentation](https://docs.example.com)
- 🐛 Issues: [GitHub Issues](https://github.com/imnaeem/aibot-frontend/issues)

## 🙏 Acknowledgments

- Built with [Create React App](https://create-react-app.dev/)
- UI components by [Material-UI](https://mui.com/)
- Authentication by [Supabase](https://supabase.com/)
- AI model inference via [Ollama](https://ollama.ai/) and various cloud providers
