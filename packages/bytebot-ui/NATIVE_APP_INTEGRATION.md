# Virtual App Integration - Completely Isolated Web OS

This document describes how the H0L0 Web OS provides a virtual app environment that is completely isolated from the user's PC.

## Overview

The H0L0 Web OS runs virtual web applications in a completely isolated environment, providing users with access to popular applications like Spotify, Cursor AI, Microsoft Office, and more, all within a unified web-based operating system. **No access to the user's PC is required or possible.**

## Architecture

### 1. Electron Integration
- **Main Process** (`electron/main.js`): Handles native app launching and process management
- **Preload Script** (`electron/preload.js`): Exposes native functionality to the renderer process
- **Renderer Process**: The web-based UI that users interact with

### 2. Native App Bridge (`src/lib/native-app-bridge.ts`)
- Manages the lifecycle of native applications
- Handles window embedding and management
- Provides streaming capabilities for web browsers
- Manages app instances and their properties

### 3. Windows Integration (`src/lib/windows-integration.ts`)
- Provides Windows-specific functionality
- Manages system notifications
- Handles file system operations
- Manages system tray and process monitoring

## Features

### ✅ Native App Launching
- Launch any Windows executable from the web OS
- Automatic process management and cleanup
- Real-time process monitoring
- Resource usage tracking (CPU, memory)

### ✅ Window Management
- Native apps run in resizable, draggable windows
- Minimize, maximize, and close functionality
- Z-index management for proper layering
- Window state persistence

### ✅ System Integration
- Windows-style system tray
- Native notifications
- File system access
- Process monitoring and management

### ✅ Seamless Experience
- Native apps appear as part of the web OS
- Consistent theming and styling
- Unified window management
- Cross-app communication

## Supported Applications

The system supports launching and managing these popular Windows applications:

### Productivity
- **Microsoft Office Suite** (Excel, Word, PowerPoint)
- **Notion** - All-in-one workspace
- **Adobe Creative Suite** (Photoshop, Illustrator)

### Development
- **Cursor AI** - AI-powered code editor
- **Visual Studio Code** - Code editor and IDE
- **Figma** - Design and prototyping tool

### Entertainment
- **Spotify** - Music streaming
- **Discord** - Voice and text communication
- **Steam** - Gaming platform

### Utilities
- **Google Chrome** - Web browser
- **File Explorer** - File management
- **System Tools** - Task Manager, Settings

## Installation & Setup

### Prerequisites
- Node.js 18+ installed
- Windows 10/11 operating system
- Administrator privileges (for some apps)

### Quick Start

1. **Install Dependencies**
   ```bash
   cd apps/frontend
   npm install
   cd electron
   npm install
   ```

2. **Start the Application**
   ```bash
   # Windows Batch
   scripts/start-electron.bat
   
   # PowerShell
   scripts/start-electron.ps1
   
   # Manual
   npm run dev  # In frontend directory
   npm run dev  # In electron directory
   ```

3. **Launch Native Apps**
   - Open the App Store from the desktop
   - Navigate to "Native Apps" section
   - Click "Install & Launch" on any app
   - The native Windows application will open within the web OS

## Technical Implementation

### App Launching Process

1. **Detection**: System scans for installed applications
2. **Validation**: Checks if the executable exists and is accessible
3. **Launch**: Uses Electron's `child_process.spawn()` to launch the native app
4. **Embedding**: Embeds the app window into the web OS interface
5. **Management**: Tracks process state, resources, and window properties

### Window Embedding

```typescript
// Launch a native app
const result = await nativeAppBridge.launchNativeApp('spotify', {
  width: 800,
  height: 600,
  frameRate: 30,
  quality: 'high',
  audio: true,
  cursor: true
})
```

### Process Management

```typescript
// Monitor running apps
const runningApps = nativeAppBridge.getRunningApps()

// Terminate an app
await nativeAppBridge.terminateApp(processId)

// Bring app to front
nativeAppBridge.bringToFront(instanceId)
```

### System Integration

```typescript
// Show Windows notification
windowsIntegration.showNotification({
  title: 'App Launched',
  message: 'Spotify is now running',
  icon: '🎵',
  appName: 'Spotify'
})

// Open file with default app
await windowsIntegration.openFile('C:\\Users\\Documents\\file.docx')
```

## Configuration

### App Registry
Add new applications to the registry in `src/lib/native-app-bridge.ts`:

```typescript
const apps: Record<string, any> = {
  'myapp': {
    name: 'My Application',
    executable: 'C:\\Program Files\\MyApp\\myapp.exe',
    icon: '🖥️',
    args: []
  }
}
```

### System Tray
Configure system tray items in `src/lib/windows-integration.ts`:

```typescript
this.systemTray = [
  {
    id: 'myapp',
    name: 'My App',
    icon: '🖥️',
    tooltip: 'My Application',
    isActive: false,
    onClick: () => this.launchApp('myapp')
  }
]
```

## Security Considerations

### Process Isolation
- Native apps run in separate processes
- Limited access to web OS data
- Sandboxed execution environment

### File System Access
- Controlled file system access
- User permission prompts
- Secure file operations

### Network Security
- Isolated network access for native apps
- Secure communication channels
- Encrypted data transmission

## Performance Optimization

### Resource Management
- Automatic cleanup of terminated processes
- Memory usage monitoring
- CPU usage optimization

### Streaming Optimization
- Adaptive quality based on system resources
- Efficient video encoding
- Low-latency streaming

### Caching
- App metadata caching
- Icon and asset caching
- Process state caching

## Troubleshooting

### Common Issues

1. **App Won't Launch**
   - Check if the executable path is correct
   - Verify the app is installed
   - Check Windows permissions

2. **Performance Issues**
   - Reduce streaming quality
   - Close unnecessary apps
   - Check system resources

3. **Window Management Issues**
   - Restart the web OS
   - Check window state
   - Verify z-index settings

### Debug Mode

Enable debug mode for detailed logging:

```bash
npm run dev -- --debug
```

### Logs

Check the following log files:
- `logs/electron.log` - Electron main process logs
- `logs/renderer.log` - Web OS renderer logs
- `logs/native-apps.log` - Native app integration logs

## Future Enhancements

### Planned Features
- **Multi-monitor Support**: Native apps across multiple displays
- **App Store Integration**: Download and install apps directly
- **Cloud Sync**: Sync app states across devices
- **Mobile Integration**: Run native apps on mobile devices
- **AI Integration**: Smart app recommendations and automation

### Performance Improvements
- **Hardware Acceleration**: GPU-accelerated rendering
- **WebAssembly Integration**: Faster native app execution
- **Edge Computing**: Distributed app processing

## Contributing

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Code Style
- Follow TypeScript best practices
- Use ESLint and Prettier
- Write comprehensive tests
- Document all public APIs

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue on GitHub
- Join our Discord community
- Check the documentation wiki
- Contact the development team

---

**Note**: This integration requires Windows 10/11 and may not work on other operating systems. Some features require administrator privileges.
