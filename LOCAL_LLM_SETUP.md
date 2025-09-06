# Local LLM Setup for ByteBot

This guide explains how to use ByteBot with locally installed LLMs instead of API-based models.

## Overview

ByteBot now supports running LLMs locally using Ollama, which provides several benefits:

- **Complete Privacy**: Your data never leaves your infrastructure
- **No API Costs**: No per-token charges for model usage
- **Offline Capability**: Works without internet connection
- **Full Control**: Use any model you want, including custom fine-tuned models

## Quick Start

### 1. Deploy ByteBot with Local LLM Support

The modified ByteBot now includes Ollama by default in the desktop container:

```bash
# Clone the repository
git clone https://github.com/bytebot-ai/bytebot.git
cd bytebot

# Deploy with Docker Compose
docker-compose -f docker/docker-compose.yml up -d
```

### 2. Access the Model Management Interface

1. Open ByteBot UI at `http://localhost:9992`
2. Go to the **Desktop** tab
3. Click on **Local Models** in the sidebar
4. You'll see the model management interface

### 3. Install Your First Model

In the model management interface:

1. **Install Popular Models**: Click the download button next to any popular model (e.g., `llama3.2:3b`)
2. **Install Custom Model**: Enter a model name in the custom field (e.g., `llama3.2:latest`)

### 4. Use Local Models in Tasks

1. Go back to the main task creation page
2. In the model selector, you'll now see local models prefixed with "Local:"
3. Select a local model and create your task as usual

## Available Models

### Recommended Models (by size)

**Small & Fast (1-3B parameters):**
- `llama3.2:1b` - Very fast, good for simple tasks
- `llama3.2:3b` - Balanced speed and capability
- `qwen2.5:3b` - Alternative small model
- `phi3:mini` - Microsoft's efficient model

**Medium (7-8B parameters):**
- `llama3.1:8b` - Good balance of capability and speed
- `llama3.2:8b` - Latest Llama 3.2 medium model

**Large (70B+ parameters):**
- `llama3.2:70b` - High capability, requires significant resources

### Model Selection Guide

- **For simple tasks**: Use 1B-3B models (fast, low resource usage)
- **For complex reasoning**: Use 8B+ models (slower, higher resource usage)
- **For development/testing**: Start with 3B models
- **For production**: Use 8B+ models for better results

## Resource Requirements

### Minimum Requirements
- **RAM**: 4GB for 3B models, 8GB for 8B models, 40GB+ for 70B models
- **CPU**: 4+ cores recommended
- **Storage**: 2-5GB per model

### Recommended Requirements
- **RAM**: 16GB+ for smooth operation
- **CPU**: 8+ cores
- **Storage**: 50GB+ for multiple models

## Advanced Configuration

### Environment Variables

You can configure Ollama URL in your environment:

```bash
# In docker/.env
OLLAMA_URL=http://bytebot-desktop:11434
```

### Custom Model Installation

You can install any model available in Ollama's library:

```bash
# Via the UI (recommended)
# Enter model name in the custom model field

# Via command line (in desktop container)
docker exec -it bytebot-desktop ollama pull <model-name>
```

### Model Management Commands

Access the desktop container to manage models directly:

```bash
# List installed models
docker exec -it bytebot-desktop ollama list

# Pull a new model
docker exec -it bytebot-desktop ollama pull llama3.2:latest

# Remove a model
docker exec -it bytebot-desktop ollama rm llama3.2:latest

# Check Ollama status
docker exec -it bytebot-desktop ollama ps
```

## Troubleshooting

### Ollama Not Starting

If Ollama fails to start:

1. Check container logs: `docker logs bytebot-desktop`
2. Restart the desktop container: `docker restart bytebot-desktop`
3. Check if port 11434 is available

### Model Download Issues

If model downloads fail:

1. Check internet connection
2. Verify model name is correct
3. Check available disk space
4. Try downloading a smaller model first

### Performance Issues

If tasks are slow:

1. Use smaller models (3B instead of 8B)
2. Increase container memory allocation
3. Close other applications
4. Use SSD storage for better I/O

### Memory Issues

If you get out-of-memory errors:

1. Use smaller models
2. Increase Docker memory limits
3. Close other applications
4. Consider using model quantization

## API Access

You can also access Ollama directly via API:

```bash
# List models
curl http://localhost:11434/api/tags

# Chat with a model
curl http://localhost:11434/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "model": "llama3.2:3b",
    "messages": [
      {
        "role": "user",
        "content": "Hello, how are you?"
      }
    ]
  }'
```

## Model Customization

### Fine-tuned Models

You can use your own fine-tuned models:

1. Create a Modelfile in the desktop container
2. Build your custom model: `ollama create mymodel -f Modelfile`
3. Use it in ByteBot tasks

### Model Parameters

You can customize model behavior by modifying the LocalService in the agent code to adjust temperature, top_p, and other parameters.

## Security Considerations

- Local models run in isolated containers
- No data is sent to external services
- Models are stored locally on your infrastructure
- Consider encrypting model storage for sensitive environments

## Performance Optimization

### For Development
- Use 1B-3B models for fast iteration
- Enable model caching
- Use SSD storage

### For Production
- Use 8B+ models for better results
- Allocate sufficient memory
- Monitor resource usage
- Consider GPU acceleration (future feature)

## Support

For issues with local LLM setup:

1. Check the troubleshooting section above
2. Review container logs
3. Join our Discord community
4. Open an issue on GitHub

## Future Enhancements

Planned features for local LLM support:

- GPU acceleration support
- Model quantization options
- Custom model fine-tuning interface
- Model performance metrics
- Automatic model selection based on task complexity
