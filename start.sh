#!/bin/bash

echo "🚀 Starting ByteBot with Local LLM Support..."
echo "=============================================="
echo ""
echo "This will start ByteBot with Ollama for local LLM support."
echo "No API keys required - everything runs locally!"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose > /dev/null 2>&1; then
    echo "❌ docker-compose is not installed. Please install it first."
    exit 1
fi

echo "✅ Docker is running"
echo "✅ docker-compose is available"
echo ""

# Start the services
echo "🐳 Starting ByteBot services..."
docker-compose -f docker/docker-compose.yml up -d

echo ""
echo "⏳ Waiting for services to start..."
sleep 10

# Check if services are running
echo "🔍 Checking service status..."
docker-compose -f docker/docker-compose.yml ps

echo ""
echo "🎉 ByteBot is starting up!"
echo ""
echo "📱 Access the application at: http://localhost:9992"
echo "🖥️  Desktop view: http://localhost:9992/desktop"
echo "🤖 Model management: http://localhost:9992/desktop (click 'Local Models')"
echo ""
echo "📋 Next steps:"
echo "1. Open http://localhost:9992 in your browser"
echo "2. Go to Desktop tab → Local Models"
echo "3. Install a model like 'llama3.2:3b'"
echo "4. Create your first task!"
echo ""
echo "📚 For detailed setup instructions, see LOCAL_LLM_SETUP.md"
echo ""
echo "🛑 To stop ByteBot: docker-compose -f docker/docker-compose.yml down"
