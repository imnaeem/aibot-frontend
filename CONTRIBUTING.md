# Contributing to AI Bot Frontend

Thank you for your interest in contributing to the AI Bot Frontend project! We welcome contributions from the community and are excited to see what you can bring to the project.

## 🚀 Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/your-username/aibot-frontend.git
   cd aibot-frontend
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Set up environment variables** by copying `.env.example` to `.env` and filling in the values
5. **Start the development server**:
   ```bash
   npm start
   ```

## 📋 Code Style and Standards

- We use ESLint for code linting
- Follow the existing code style and patterns
- Write meaningful commit messages
- Add comments for complex logic
- Ensure your code is properly formatted

### Running Linting
```bash
npm run lint          # Check for issues
npm run lint:fix      # Automatically fix issues
```

## 🐛 Reporting Issues

Before creating an issue, please check if it already exists. When reporting bugs, include:

- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
- Browser and OS information
- Console errors (if any)

## 💡 Feature Requests

We welcome feature requests! Please:

1. Check if the feature already exists or is planned
2. Create a detailed issue describing:
   - The problem you're trying to solve
   - Your proposed solution
   - Any alternatives considered
   - Mockups or examples (if applicable)

## 🔧 Development Guidelines

### Component Structure
```
src/components/
├── ComponentName/
│   ├── index.js           # Main component
│   ├── ComponentName.js   # Implementation
│   └── styles.js          # Styled components (if needed)
```

### Hooks
- Custom hooks should be in `src/hooks/`
- Follow the `use` naming convention
- Include JSDoc comments for complex hooks

### Services
- API calls should be in `src/services/`
- Use consistent error handling
- Include proper TypeScript types where applicable

## 🧪 Testing

- Write tests for new components and functions
- Run tests before submitting: `npm test`
- Ensure all tests pass in your PR

## 📝 Pull Request Process

1. **Create a feature branch** from main:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following the coding standards

3. **Test your changes**:
   ```bash
   npm test
   npm run lint
   npm run build
   ```

4. **Commit your changes**:
   ```bash
   git add .
   git commit -m "feat: add amazing new feature"
   ```

5. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request** with:
   - Clear title and description
   - Reference to related issues
   - Screenshots for UI changes
   - Testing instructions

### Commit Message Format
Follow conventional commits:
- `feat:` new features
- `fix:` bug fixes
- `docs:` documentation changes
- `style:` formatting, missing semicolons, etc
- `refactor:` code changes that neither fix bugs nor add features
- `test:` adding or correcting tests
- `chore:` updating build tasks, package manager configs, etc

## 🎨 UI/UX Contributions

- Follow Material-UI design principles
- Ensure responsive design
- Test on different screen sizes
- Maintain accessibility standards
- Include dark/light theme support

## 📚 Documentation

- Update README.md for new features
- Add JSDoc comments for functions
- Include code examples where helpful
- Update this CONTRIBUTING.md if needed

## 🤝 Community Guidelines

- Be respectful and inclusive
- Help others learn and grow
- Ask questions if you're unsure
- Share knowledge and best practices

## 📞 Getting Help

- Create an issue for bug reports or feature requests
- Use discussions for questions and ideas
- Check existing issues and documentation first

## 🏆 Recognition

Contributors will be acknowledged in:
- README.md contributors section
- Release notes for significant contributions
- Special mentions in project updates

Thank you for contributing to AI Bot Frontend! 🚀