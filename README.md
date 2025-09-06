<div align="center">

<img src="docs/images/bytebot-logo.png" width="500" alt="Bytebot Logo">

# Bytebot: Open-Source AI Desktop Agent

<a href="https://trendshift.io/repositories/14624" target="_blank"><img src="https://trendshift.io/api/badge/repositories/14624" alt="bytebot-ai%2Fbytebot | Trendshift" style="width: 250px; height: 55px;" width="250" height="55"/></a>

**An AI that has its own computer to complete tasks for you - 100% Local & Private**

[![Docker](https://img.shields.io/badge/docker-ready-blue.svg)](https://github.com/Commander17X/ByteBoxFork/tree/main/docker)
[![License](https://img.shields.io/badge/license-Apache%202.0-green.svg)](LICENSE)
[![Local Only](https://img.shields.io/badge/LLM-Local%20Only-green.svg)](https://github.com/Commander17X/ByteBoxFork)

**🔒 Complete Privacy • 🚀 No API Costs • 🏠 Runs Locally**

</div>

---

https://github.com/user-attachments/assets/f271282a-27a3-43f3-9b99-b34007fdd169

https://github.com/user-attachments/assets/72a43cf2-bd87-44c5-a582-e7cbe176f37f

## What is a Desktop Agent?

A desktop agent is an AI that has its own computer. Unlike browser-only agents or traditional RPA tools, Bytebot comes with a full virtual desktop where it can:

- Use any application (browsers, email clients, office tools, IDEs)
- Download and organize files with its own file system
- Log into websites and applications using password managers
- Read and process documents, PDFs, and spreadsheets
- Complete complex multi-step workflows across different programs

Think of it as a virtual employee with their own computer who can see the screen, move the mouse, type on the keyboard, and complete tasks just like a human would.

## Why Give AI Its Own Computer?

When AI has access to a complete desktop environment, it unlocks capabilities that aren't possible with browser-only agents or API integrations:

### Complete Task Autonomy

Give Bytebot a task like "Download all invoices from our vendor portals and organize them into a folder" and it will:

- Open the browser
- Navigate to each portal
- Handle authentication (including 2FA via password managers)
- Download the files to its local file system
- Organize them into a folder

### Process Documents

Upload files directly to Bytebot's desktop and it can:

- Read entire PDFs into its context
- Extract data from complex documents
- Cross-reference information across multiple files
- Create new documents based on analysis
- Handle formats that APIs can't access

### Use Real Applications

Bytebot isn't limited to web interfaces. It can:

- Use desktop applications like text editors, VS Code, or email clients
- Run scripts and command-line tools
- Install new software as needed
- Configure applications for specific workflows

## Quick Start

### Deploy in 2 Minutes - No API Keys Required!

**Docker Compose (Local Only)**

```bash
git clone https://github.com/Commander17X/ByteBoxFork.git
cd ByteBoxFork

# No API keys needed - everything runs locally!
docker-compose -f docker/docker-compose.yml up -d

# Open http://localhost:9992
# Go to Desktop tab → Local Models to install your first model
```

**That's it!** ByteBot will automatically download a default model and you can install more through the web interface.

## How It Works

Bytebot consists of four integrated components:

1. **Virtual Desktop**: A complete Ubuntu Linux environment with Ollama and pre-installed applications
2. **Local AI Agent**: Uses local LLMs (via Ollama) to understand tasks and control the desktop
3. **Task Interface**: Web UI where you create tasks and watch Bytebot work
4. **APIs**: REST endpoints for programmatic task creation and desktop control

### Key Features

- **100% Local & Private**: No data leaves your infrastructure
- **No API Costs**: Use your own hardware, no per-token charges
- **Natural Language Tasks**: Just describe what you need done
- **File Uploads**: Drop files onto tasks for Bytebot to process
- **Live Desktop View**: Watch Bytebot work in real-time
- **Takeover Mode**: Take control when you need to help or configure something
- **Password Manager Support**: Install 1Password, Bitwarden, etc. for automatic authentication
- **Persistent Environment**: Install programs and they stay available for future tasks
- **Local Model Management**: Install, manage, and switch between different LLMs

## Example Tasks

### Basic Examples

```
"Go to Wikipedia and create a summary of quantum computing"
"Research flights from NYC to London and create a comparison document"
"Take screenshots of the top 5 news websites"
```

### Document Processing

```
"Read the uploaded contracts.pdf and extract all payment terms and deadlines"
"Process these 5 invoice PDFs and create a summary report"
"Download and analyze the latest financial report and answer: What were the key risks mentioned?"
```

### Multi-Application Workflows

```
"Download last month's bank statements from our three banks and consolidate them"
"Check all our vendor portals for new invoices and create a summary report"
"Log into our CRM, export the customer list, and update records in the ERP system"
```

## Programmatic Control

### Create Tasks via API

```python
import requests

# Simple task
response = requests.post('http://localhost:9991/tasks', json={
    'description': 'Download the latest sales report and create a summary'
})

# Task with file upload
files = {'files': open('contracts.pdf', 'rb')}
response = requests.post('http://localhost:9991/tasks',
    data={'description': 'Review these contracts for important dates'},
    files=files
)
```

### Direct Desktop Control

```bash
# Take a screenshot
curl -X POST http://localhost:9990/computer-use \
  -H "Content-Type: application/json" \
  -d '{"action": "screenshot"}'

# Click at specific coordinates
curl -X POST http://localhost:9990/computer-use \
  -H "Content-Type: application/json" \
  -d '{"action": "click_mouse", "coordinate": [500, 300]}'
```

[Full API documentation →](https://docs.bytebot.ai/api-reference/introduction)

## Setting Up Your Desktop Agent

### 1. Deploy Bytebot

Use one of the deployment methods above to get Bytebot running.

### 2. Configure the Desktop

Use the Desktop tab in the UI to:

- Install additional programs you need
- Set up password managers for authentication
- Configure applications with your preferences
- Log into websites you want Bytebot to access

### 3. Start Giving Tasks

Create tasks in natural language and watch Bytebot complete them using the configured desktop.

## Use Cases

### Business Process Automation

- Invoice processing and data extraction
- Multi-system data synchronization
- Report generation from multiple sources
- Compliance checking across platforms

### Development & Testing

- Automated UI testing
- Cross-browser compatibility checks
- Documentation generation with screenshots
- Code deployment verification

### Research & Analysis

- Competitive analysis across websites
- Data gathering from multiple sources
- Document analysis and summarization
- Market research compilation

## Architecture

Bytebot is built with:

- **Desktop**: Ubuntu 22.04 with XFCE, Firefox, VS Code, Ollama, and other tools
- **Agent**: NestJS service that coordinates local AI and desktop actions
- **UI**: Next.js application for task management and model management
- **AI Support**: Local LLMs via Ollama (llama3.2, qwen2.5, phi3, and more)
- **Deployment**: Docker containers for easy self-hosting

## Why Self-Host?

- **Complete Privacy**: Everything runs on your infrastructure, no external API calls
- **No API Costs**: Use your own hardware, no per-token charges
- **Full Control**: Customize the desktop environment and models as needed
- **Offline Capability**: Works without internet connection
- **Flexibility**: Install any software, access any systems, use any LLM model

## Advanced Features

### Local Model Management

- **Model Installation**: Install any Ollama-compatible model through the web UI
- **Model Switching**: Switch between different models for different tasks
- **Resource Management**: Monitor model usage and performance
- **Custom Models**: Use your own fine-tuned models

### Enterprise Deployment

Deploy on Kubernetes with Helm:

```bash
# Clone the repository
git clone https://github.com/Commander17X/ByteBoxFork.git
cd ByteBoxFork

# Install with Helm (no API keys needed!)
helm install bytebot ./helm
```

[Enterprise deployment guide →](https://docs.bytebot.ai/deployment/helm)

## Community & Support

- **GitHub Issues**: Report bugs and request features
- **Documentation**: See `LOCAL_LLM_SETUP.md` for detailed setup guide

## Contributing

We welcome contributions! Whether it's:

- 🐛 Bug fixes
- ✨ New features
- 📚 Documentation improvements
- 🌐 Translations

Please:

1. Check existing [issues](https://github.com/Commander17X/ByteBoxFork/issues) first
2. Open an issue to discuss major changes
3. Submit PRs with clear descriptions

## License

Bytebot is open source under the Apache 2.0 license.

---

<div align="center">

**Give your AI its own computer. See what it can do - 100% locally and privately.**

```bash
git clone https://github.com/Commander17X/ByteBoxFork.git
cd ByteBoxFork
docker-compose -f docker/docker-compose.yml up -d
```

<sub>Forked from [ByteBot](https://github.com/bytebot-ai/bytebot) with local LLM integration</sub>

</div>
