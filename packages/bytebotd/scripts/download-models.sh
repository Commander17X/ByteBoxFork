#!/bin/bash

# Script to download popular LLM models for local use
# This script should be run after the desktop container is started

echo "Starting model download process..."

# Wait for Ollama to be ready
echo "Waiting for Ollama to be ready..."
while ! curl -s http://localhost:11434/api/tags > /dev/null; do
    echo "Ollama not ready yet, waiting 5 seconds..."
    sleep 5
done

echo "Ollama is ready! Starting model downloads..."

# List of popular models to download (in order of preference)
MODELS=(
    "llama3.2:3b"      # Small, fast model
    "llama3.2:1b"      # Very small, very fast model
    "llama3.1:8b"      # Medium model
    "qwen2.5:3b"       # Alternative small model
    "phi3:mini"        # Microsoft's small model
)

# Function to download a model
download_model() {
    local model=$1
    echo "Downloading model: $model"
    
    if ollama pull "$model"; then
        echo "Successfully downloaded: $model"
    else
        echo "Failed to download: $model"
    fi
}

# Download models one by one
for model in "${MODELS[@]}"; do
    download_model "$model"
    echo "---"
done

echo "Model download process completed!"
echo "Available models:"
ollama list
