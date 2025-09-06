#!/bin/bash

# Startup script to download default models
# This runs in the background after Ollama starts

echo "Starting model download process in background..."

# Wait for Ollama to be ready
echo "Waiting for Ollama to be ready..."
while ! curl -s http://localhost:11434/api/tags > /dev/null; do
    echo "Ollama not ready yet, waiting 10 seconds..."
    sleep 10
done

echo "Ollama is ready! Starting background model downloads..."

# Download a small default model in the background
nohup bash -c '
    echo "Downloading default model: llama3.2:3b"
    if ollama pull llama3.2:3b; then
        echo "Successfully downloaded llama3.2:3b"
    else
        echo "Failed to download llama3.2:3b"
    fi
' > /tmp/model-download.log 2>&1 &

echo "Model download started in background. Check /tmp/model-download.log for progress."
