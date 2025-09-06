# AI Service Integration

This feature automatically configures AI models during user account setup to provide a seamless experience with server-side AI capabilities.

## Overview

The AI Service integrates with the user registration flow to automatically configure AI models on the server. This ensures that users have immediate access to AI-powered features without manual setup, while providing optimal performance and resource management.

## Features

- **Automatic Configuration**: Models are configured during account setup
- **Progress Tracking**: Real-time progress updates during configuration
- **Model Management**: Users can manage models in settings
- **Server-Side Processing**: Models run on the server for optimal performance
- **Multiple Providers**: Support for Ollama, OpenAI, and Anthropic APIs
- **Health Monitoring**: Continuous monitoring of model availability

## Supported Models

### Required Models
- **LLaVA 1.6 Mistral 7B** (4.2GB) - Advanced vision-language model for image understanding

### Optional Models
- **LLaVA 1.5 7B** (4.1GB) - Reliable vision model for general image processing
- **Qwen-VL 7B** (4.3GB) - Multilingual vision model with excellent text recognition

## Components

### Core Components
- `LLMSetup` - Main setup component shown during registration
- `LLMSettings` - Settings component for managing models
- `RegistrationSuccess` - Updated to include LLM setup option

### Services
- `llmSetupService` - Core service for managing model downloads
- `webllmIntegration` - WebLLM integration for local model execution

### Hooks
- `useLLMSetup` - React hook for LLM setup state management

## User Flow

1. **Registration**: User creates account
2. **Success Screen**: Shows registration success with LLM setup option
3. **LLM Setup**: User can choose to download models or skip
4. **Download Process**: Models are downloaded with progress tracking
5. **Completion**: User is redirected to dashboard with AI capabilities ready

## API Endpoints

### Frontend API Routes
- `POST /api/llm-setup` - Update LLM setup status
- `GET /api/llm-setup` - Get LLM setup status

### Backend API Routes
- `POST /api/auth/llm-setup` - Update user's LLM setup preferences
- `GET /api/auth/llm-setup` - Get user's LLM setup status

## Configuration

### Model Configuration
Models are configured in `llm-setup-service.ts`:

```typescript
const defaultModels: LLMModel[] = [
  {
    id: 'llava-v1.6-mistral-7b',
    name: 'LLaVA 1.6 Mistral 7B',
    size: '4.2GB',
    description: 'Advanced vision-language model',
    required: true,
    priority: 1
  }
  // ... more models
]
```

### WebLLM Configuration
WebLLM is configured in `webllm-integration.ts`:

```typescript
const config: WebLLMConfig = {
  model: 'llava-v1.6-mistral-7b',
  device: 'webgpu', // Auto-detects CUDA/GPU
  maxTokens: 1024,
  temperature: 0.7,
  gpuMemory: 16384 // 16GB VRAM
}
```

## Storage

### User Preferences
LLM setup status is stored in user preferences:

```typescript
interface UserPreferences {
  llmSetup?: {
    isCompleted: boolean
    completedAt?: string
    downloadedModels: string[]
    skippedSetup: boolean
  }
}
```

### Local Storage
Models are cached locally by WebLLM in the browser's IndexedDB.

## Error Handling

- **WebLLM Unavailable**: Graceful fallback to cloud-based processing
- **Download Failures**: Retry mechanism with user notification
- **Storage Issues**: Clear error messages and recovery options
- **Network Issues**: Offline mode with cached models

## Performance Considerations

- **Sequential Downloads**: Models are downloaded one at a time to avoid overwhelming the system
- **Progress Tracking**: Real-time progress updates for better UX
- **Caching**: Downloaded models are cached for future use
- **Memory Management**: Models are loaded/unloaded as needed

## Security & Privacy

- **Local Processing**: All AI processing happens locally on the user's device
- **No Data Transmission**: User data is not sent to external servers
- **Secure Storage**: Models are stored securely in browser storage
- **User Control**: Users can remove models at any time

## Development

### Testing
```bash
# Test LLM setup flow
npm run dev
# Navigate to registration and test the setup flow
```

### Adding New Models
1. Add model configuration to `llm-setup-service.ts`
2. Update WebLLM model mapping in `webllm-integration.ts`
3. Add model icon and description to UI components
4. Test download and functionality

### Debugging
- Check browser console for WebLLM initialization logs
- Monitor network requests for model downloads
- Verify IndexedDB storage for cached models
- Check user preferences for setup status

## Future Enhancements

- **Model Updates**: Automatic model updates and versioning
- **Custom Models**: Support for user-uploaded models
- **Performance Metrics**: Model performance tracking
- **Batch Operations**: Download multiple models simultaneously
- **Model Compression**: Optimized model formats for faster downloads
