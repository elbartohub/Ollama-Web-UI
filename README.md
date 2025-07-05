# Ollama Web UI

A modern, responsive web interface for interacting with Ollama models. This web UI provides a clean chat interface with robust session management, localStorage persistence, RTF export functionality, and comprehensive code formatting capabilities.
![Screenshot 2025-07-06 at 7 20 02 AM](https://github.com/user-attachments/assets/ac0d8a3a-50e0-4272-910a-3aac3e281fed)

## 🚀 Features

### Core Functionality
- **🔧 Server Configuration**: Easy setup with custom Ollama server IP address
- **🤖 Model Selection**: Choose from available models with automatic detection
- **📁 File Upload**: Support for images and documents (drag & drop or click to upload)
- **🌊 Streaming Responses**: Real-time streaming of model responses with typing animation
- **💬 Chat Interface**: Clean, modern chat bubbles with timestamps
- **💻 Auto Code Formatting**: Automatic detection and syntax highlighting for programming languages

### Session Management & Persistence
- **💾 localStorage Storage**: All sessions saved to browser localStorage with optional backend support
- **📱 History Panel**: Dedicated panel for browsing, loading, and managing chat sessions
- **🗂️ Session Management**: Save, load, rename, and delete chat sessions with visual indicators
- **📤 Export/Import**: Export all sessions as JSON or import from backups (available in Settings panel)
- **⚡ Auto-save**: Automatic session saving after each message
- **🧠 System Prompts**: Customize AI behavior with persistent system instructions per session

### Advanced Features
- **📄 RTF Export**: Save individual conversations to Rich Text Format files with proper formatting
- **🧮 Math Rendering**: KaTeX support for mathematical equations
- **🖼️ Vision Support**: Automatic detection and support for vision-capable models
- **📊 Connection Status**: Real-time connection status indicator with detailed error messages
- **🎨 Code Blocks**: Advanced syntax highlighting, language detection, and copy-to-clipboard functionality

### User Experience
- **🎨 Modern UI**: Beautiful, intuitive interface with uniform button design and smooth animations
- **🔔 Smart Notifications**: Toast notifications for successful actions and errors
- **⚡ Performance**: Optimized for fast loading and smooth interactions
- **🎯 Accessibility**: Keyboard shortcuts and screen reader friendly
- **🌅 Clean Startup**: Always starts with welcome message, chat history accessible only via History panel

## 📋 Requirements
- **Modern Web Browser**: Chrome 80+, Firefox 75+, Safari 13+, or Edge 80+
- **Models**: At least one Ollama model installed on your server
- **Network**: Proper network connectivity and CORS configuration for remote servers

## 🛠️ Quick Start

### 1. Install and Setup Ollama

**On the server machine (Windows/macOS/Linux):**

```bash
# Install Ollama (if not already installed)
# Visit https://ollama.ai for installation instructions

# Start Ollama server
ollama serve

# Pull a model (choose one or more)
ollama pull llama3.1        # Text model
ollama pull llava           # Vision model
ollama pull codellama       # Code model
```

### 2. Configure CORS (For Remote Servers)

**If your Ollama server is on a different machine, configure CORS:**

**Windows (Command Prompt as Administrator):**
```cmd
setx OLLAMA_ORIGINS "*" /M
setx OLLAMA_HOST "0.0.0.0:11434" /M
net stop ollama
net start ollama
```

**macOS/Linux:**
```bash
export OLLAMA_ORIGINS="*"
export OLLAMA_HOST="0.0.0.0:11434"
# Restart ollama
```

### 3. Launch the Web UI

**Option A: Direct File Access (Primary Method)**
- Simply open `index.html` in your web browser
- Sessions automatically saved to browser localStorage
- All features available except backend API storage

**Option B: Backend Server (Optional Enhanced Features)**
```bash
# Navigate to the project directory
cd /path/to/ollama-web-ui

# Install dependencies (first time only)
npm install

# Start the backend server
npm start
# or
node server.js
```

The backend server will:
- Start on `http://localhost:3001`
- Serve the web interface
- Provide optional session storage API
- Create the `sessions/` directory for chat history
- Display startup information in the terminal

### 4. Access the Web Interface

**Direct File Access**: Open `index.html` directly in your browser (recommended)

**With Backend Server**: Open your browser and navigate to: **`http://localhost:3001`**

### 5. Configure and Start Chatting

1. **Open Settings**: Click the gear icon in the header
2. **Set Server URL**: Enter your Ollama server address (e.g., `http://192.168.1.100:11434`)
3. **Select Model**: Choose from the automatically detected models
4. **Optional**: Set a system prompt for AI behavior customization
5. **Start Chatting**: Type messages, upload files, and enjoy!

## 💬 Usage Guide

### Session Management & Storage

**localStorage-Based Storage:**
- **Primary Storage**: All sessions automatically saved to browser localStorage
- **Backend Integration**: Optional backend API support for enhanced features
- **Persistent Sessions**: Sessions persist across browser sessions and restarts
- **Cross-Device**: Use backend server for sharing sessions across devices/browsers

**Session Controls:**
- **Auto-save**: Every message automatically saves to current session
- **New Chat**: Start fresh conversation (previous sessions remain in History panel)
- **History Panel**: Click History button to browse all saved sessions
- **Session Actions**: Load, rename, or delete sessions from History panel
- **Clean Startup**: Always starts with welcome message, no auto-loading of previous chats

**Export/Import (Settings Panel):**
- **Export History**: Save all sessions as JSON backup file
- **Import History**: Restore sessions from JSON backup (merges with existing)
- **Clear History**: Remove all saved sessions (with confirmation)
- **Storage Info**: View session count, message count, and storage usage

### AI Behavior Customization

**System Prompt:**
- **Custom Instructions**: Define how the AI should behave and respond
- **Persistent Settings**: System prompts are saved with each session
- **Global Default**: Set a default system prompt for all new conversations
- **Visual Indicators**: Sessions with custom prompts show a 🧠 brain icon
- **Examples**: 
  - `"You are a helpful coding assistant. Always provide working code examples."`
  - `"Respond in a friendly, casual tone. Use emojis when appropriate."`
  - `"You are an expert teacher. Explain concepts step by step."`

### Basic Chatting

1. **Text Messages**: 
   - Type your message in the input box
   - Press `Enter` to send (or `Shift + Enter` for new line)
   - Click the send button

2. **File Uploads**: 
   - **Method 1**: Click the paperclip icon to select files
   - **Method 2**: Drag and drop files directly into the chat area
   - **Supported formats**: Images (PNG, JPG, GIF, WebP), Documents (TXT, PDF, DOC, MD)
   - **File limit**: 10MB per file, multiple files supported

3. **Multimodal Chat**: 
   - Upload images along with text for vision-capable models
   - The UI automatically detects if your selected model supports vision
   - Models like `llava`, `minicpm-v`, `llama3.2-vision` support image analysis

### Code Formatting & Syntax Highlighting

The Ollama Web UI now includes advanced code formatting capabilities:

**🔍 Automatic Language Detection**
- Detects JavaScript, Python, HTML, CSS, SQL, Bash, JSON, YAML
- Uses content analysis to identify programming language
- Falls back to generic code formatting for unrecognized languages

**🎨 Syntax Highlighting**
- Dark theme code blocks with professional styling
- Language-specific color indicators on the left border
- Monospace font with proper line spacing for readability

**📋 Copy-to-Clipboard**
- Hover over any code block to see the copy icon (📋)
- Click to copy the entire code block to clipboard
- Visual feedback with checkmark (✓) confirmation
- Preserves original formatting and indentation

**🏷️ Language Labels**
- Automatic language labels in the top-right corner of code blocks
- Helps identify the programming language at a glance
- Uppercase styling for professional appearance

**Supported Languages:**
- **JavaScript/TypeScript**: Yellow border, automatic detection of JS syntax
- **Python**: Blue border, recognizes `def`, `import`, indentation patterns
- **HTML**: Red border, detects HTML tags and structure
- **CSS**: Blue border, identifies CSS selectors and properties  
- **SQL**: Dark blue border, recognizes database queries
- **Bash/Shell**: Green border, detects shell commands and scripts
- **JSON**: Orange border, validates and formats JSON structures
- **YAML**: Red border, recognizes YAML configuration syntax

### Export Options

**RTF Export (Header Button):**
- **Individual Chats**: Export current conversation as RTF file with proper formatting
- **Rich Format**: Includes timestamps, code blocks with proper indentation, and line breaks
- **Compatible**: Opens in Microsoft Word, LibreOffice, WordPad, etc.
- **Unicode Support**: Proper handling of CJK characters and special symbols
- **Code Formatting**: Preserves code block structure with headers and proper spacing

**JSON Export/Import (Settings Panel):**
- **All Sessions**: Export all chat history as JSON backup from Settings > Local Storage
- **Import**: Restore sessions from JSON backup files (merges with existing sessions)
- **Backup**: Create regular backups of your entire chat history
- **Version Control**: JSON files can be tracked in git if desired

## 🤖 Model Support

### Text Models
- **General Chat**: `llama3.1`, `llama3.2`, `mistral`, `gemma2`
- **Code Generation**: `codellama`, `deepseek-coder`, `codeqwen`
- **Specialized**: `dolphin-mixtral`, `neural-chat`, `orca-mini`

### Vision Models (Image Analysis)
- **LLaVA Family**: `llava`, `llava-phi3`, `llava-llama3`
- **MiniCPM**: `minicpm-v`, `minicpm-v:8b`
- **Llama Vision**: `llama3.2-vision`, `llama3.2-vision:90b`
- **BakLLaVA**: `bakllava`

### Model Capabilities Detection
The UI automatically detects:
- **Vision Support**: Shows 👁️ icon for image-capable models
- **Code Generation**: Shows 💻 icon for coding models
- **Model Size**: Displays file size for storage reference
- **Multimodal**: Automatically enables file upload for supported models

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Enter` | Send message |
| `Shift + Enter` | New line in message |
| `Escape` | Close settings panel |
| `Ctrl/Cmd + /` | Toggle settings panel |

## 🔧 Advanced Configuration

### Server Settings

**Environment Variables (Server-side):**
```bash
# Allow all origins (for web UI access)
export OLLAMA_ORIGINS="*"

# Bind to all interfaces
export OLLAMA_HOST="0.0.0.0:11434"

# Custom port
export OLLAMA_HOST="0.0.0.0:8080"
```

**Windows Service Configuration:**
```cmd
# Set permanent environment variables
setx OLLAMA_ORIGINS "*" /M
setx OLLAMA_HOST "0.0.0.0:11434" /M

# Restart Ollama service
net stop ollama
net start ollama
```

### CORS Troubleshooting

**If you see "CORS error" or "Network error":**

1. **Check Server Status**: Verify Ollama is running on the target machine
2. **Test Connectivity**: Check browser console for specific error messages
3. **Configure CORS**: Set `OLLAMA_ORIGINS="*"` environment variable
4. **Restart Service**: Always restart Ollama after changing environment variables
5. **Firewall**: Ensure port 11434 is open on the server machine
6. **Fallback Mode**: If backend unavailable, sessions automatically saved to localStorage

## 🏗️ Project Structure

```
ollama-web-ui/
├── index.html              # Main web interface
├── script.js               # Core application logic
├── styles.css              # UI styling and animations
├── chat-storage.js         # Session storage module (localStorage)
├── server.js               # Backend API server (optional)
├── package.json            # Node.js dependencies
├── sessions/               # Backend session storage (created automatically)
│   └── sessions.json       # Session data file
└── README.md               # This documentation
```

## 🛠️ Technical Implementation

### Backend Architecture

**Express.js Server** (`server.js`)
- RESTful API for session management
- Static file serving for web interface
- CORS enabled for frontend communication
- Automatic directory and file creation
- Error handling and logging

**API Endpoints:**
```javascript
GET    /api/sessions           // Load all sessions
POST   /api/sessions           // Save all sessions
POST   /api/sessions/:id       // Save individual session
DELETE /api/sessions/:id       // Delete specific session
DELETE /api/sessions           // Clear all sessions
GET    /api/backups            // List backup files
POST   /api/restore/:filename  // Restore from backup
```

### Frontend Session Management

**localStorage Integration** (`chat-storage.js` & `script.js`)
- Primary storage in browser localStorage
- Automatic session loading on startup from localStorage
- Real-time session updates and auto-save
- Clean startup: always shows welcome message
- History panel: dedicated access to all saved sessions

**Data Flow:**
1. Frontend loads sessions from localStorage on startup
2. User interactions create/modify sessions in memory
3. Auto-save immediately persists changes to localStorage
4. Manual operations (save/delete/export) update localStorage
5. History panel reflects current localStorage state

### Data Storage

**Session Format:**
```json
{
  "session_id": {
    "id": "session_timestamp_random",
    "title": "Generated from first message",
    "messages": [...],
    "model": "selected_model",
    "serverUrl": "ollama_server_url",
    "createdAt": "ISO_timestamp",
    "updatedAt": "ISO_timestamp"
  }
}
```

**Storage Locations:**
- **Primary**: Browser localStorage (`chatSessions` key)
- **Optional Backend**: `sessions/sessions.json` (when backend server running)
- **Backup Files**: `sessions/backup-YYYY-MM-DDTHH-MM-SS.json` (backend only)
- JSON format for easy inspection and portability

### Development Notes

**Frontend Architecture:**
- Uses localStorage as primary session persistence
- Optional backend integration for enhanced features
- Graceful degradation when backend unavailable
- Notifications inform users of backend connectivity status

**Backend Features:**
- Automatic backup system prevents data loss
- RESTful design allows easy integration with other tools
- File-based storage enables version control and manual inspection
- CORS configuration supports local development and deployment

## � Storage & Data Management

### Primary Storage (localStorage)
- **Main Storage**: All sessions automatically saved to browser localStorage
- **Persistent**: Sessions survive browser restarts and tab closures  
- **Fast Access**: Immediate loading without network requests
- **Cross-Session**: History accessible via dedicated History panel

### Optional Backend Storage
When using the optional Node.js backend server:

```
WebAI/
├── index.html          # Main web interface
├── styles.css          # Styling for the web UI
├── script.js           # Frontend JavaScript with localStorage management
├── chat-storage.js     # localStorage session management module
├── server.js           # Optional backend Node.js server
├── package.json        # Node.js dependencies
├── sessions/           # Directory for backend session storage (if used)
│   ├── sessions.json   # Backend sessions file
│   └── backup-*.json   # Timestamped backups
└── README.md           # This file
```

**Backend Features (Optional):**
- Enhanced session sharing across devices/browsers
- File-based backup and restore capabilities
- RESTful API for external integrations
- Automatic timestamped backups

### API Endpoints (Backend Only)

- `GET /api/sessions` - Load all sessions
- `POST /api/sessions` - Save all sessions
- `POST /api/sessions/:id` - Save individual session
- `DELETE /api/sessions/:id` - Delete session
- `DELETE /api/sessions` - Clear all sessions
- `GET /api/backups` - List available backups
- `POST /api/restore/:filename` - Restore from backup

## 📁 File Structure

```
ollama-web-ui/
├── index.html              # Main web interface
├── styles.css              # CSS styling and animations
├── script.js               # JavaScript functionality and session management
├── chat-storage.js         # localStorage session management module
├── server.js               # Optional backend API server
├── package.json            # Node.js dependencies (for backend)
└── README.md              # This documentation
```

### File Descriptions

- **`index.html`**: Main application interface with responsive design and uniform button layout
- **`styles.css`**: Modern CSS with gradients, animations, mobile support, and uniform button styling
- **`script.js`**: Core functionality including streaming, file upload, RTF export, and session management
- **`chat-storage.js`**: localStorage-based session management with import/export capabilities
- **`server.js`**: Optional backend API server for enhanced session storage features
- **`README.md`**: Comprehensive documentation and setup guide

## 🚨 Troubleshooting

### Common Issues and Solutions

#### Backend Server Issues

#### Optional Backend Server Issues

**❌ "Backend server not running" (if using backend)**
- **Solution**: Start the backend server with `npm start` or `node server.js`
- **Port Check**: Ensure port 3001 is not being used by another application
- **Dependencies**: Run `npm install` if dependencies are missing
- **Note**: Backend is optional; app works with localStorage only

#### Connection Problems

**❌ "Connection failed" / "Network error" (Ollama server)**
- **Check Server**: Verify Ollama is running: `ps aux | grep ollama` (Linux/macOS) or Task Manager (Windows)
- **Test URL**: Try accessing `http://your-server:11434/api/tags` directly in browser
- **Firewall**: Ensure port 11434 is open and accessible
- **Network**: Verify network connectivity between client and server

**❌ "CORS error"**
- **Solution**: Configure CORS on the Ollama server (see setup instructions above)
- **Verification**: Check browser console for specific CORS error messages
- **Environment Variables**: Ensure `OLLAMA_ORIGINS="*"` is set and Ollama restarted

#### Session Storage Issues

**❌ "Sessions not persisting"**
- **localStorage**: Check browser settings allow localStorage (private/incognito mode may block)
- **Browser Console**: Check for localStorage errors in developer tools
- **Storage Space**: Clear browser data if localStorage is full
- **Different Browser**: Try another browser to isolate the issue

**❌ "Import/Export not working"**
- **File Format**: Ensure JSON files are properly formatted
- **File Access**: Check browser allows file downloads/uploads
- **File Size**: Large session files may fail - try smaller batches

#### Model Issues

**❌ "No models available"**
- **Install Models**: Run `ollama pull <model-name>` on the server
- **Popular models**: `ollama pull llama3.1`, `ollama pull llava`
- **Check Installation**: Run `ollama list` to see installed models

**❌ "Model not responding"**
- **Memory**: Ensure server has enough RAM for the selected model
- **Restart**: Try restarting the Ollama service
- **Different Model**: Switch to a smaller model to test

#### File Upload Issues

**❌ "File too large"**
- **Size Limit**: Maximum 10MB per file
- **Compress**: Reduce image size or compress documents
- **Split**: Break large documents into smaller parts

**❌ "Vision not working"**
- **Model Check**: Ensure you're using a vision-capable model (llava, minicpm-v, etc.)
- **Format**: Use supported image formats (PNG, JPG, GIF, WebP)
- **Size**: Keep images under 10MB

### Performance Tips

1. **Backend Server**: Keep the Node.js backend running for optimal performance
2. **Model Size**: Smaller models respond faster but may be less capable
3. **Image Resolution**: Lower resolution images process faster
4. **Conversation Length**: Very long conversations may slow down over time
5. **Multiple Files**: Limit to 3-4 images per message for optimal performance
6. **Server Resources**: Ensure adequate RAM and CPU on the Ollama server
7. **Session Cleanup**: Periodically clear old sessions to maintain performance

### Debug Mode

**Enable browser developer tools for detailed error information:**
1. Press `F12` to open developer tools
2. Check the **Console** tab for JavaScript errors
3. Check the **Network** tab for failed requests to Ollama server
4. Look for CORS, timeout, or connection errors
5. Monitor localStorage in Application tab for session storage

**Optional Backend Server Logs (if using backend):**
- Check the terminal where `node server.js` is running
- Look for API request logs and error messages
- Verify session file operations in the `sessions/` directory

## 🔒 Security and Privacy

### Data Handling
- **Local Processing**: All conversations processed by your Ollama server
- **No External Services**: No data sent to third-party services
- **File Storage**: Uploaded files processed in memory, not stored permanently
- **Session Storage**: Sessions stored in browser localStorage or optional backend files
- **Settings Storage**: Only server URL and model preferences stored locally

### Network Security
- **HTTPS Support**: Use HTTPS URLs for encrypted communication
- **Local Network**: Recommended for use within trusted networks
- **Firewall**: Configure appropriate firewall rules for your environment

## 🎯 Browser Compatibility

| Browser | Version | Status | Notes |
|---------|---------|--------|--------|
| Chrome | 80+ | ✅ Full Support | Recommended |
| Firefox | 75+ | ✅ Full Support | Recommended |
| Safari | 13+ | ✅ Full Support | Good performance |
| Edge | 80+ | ✅ Full Support | Good performance |
| Mobile Chrome | Latest | ✅ Full Support | Responsive design |
| Mobile Safari | Latest | ✅ Full Support | Responsive design |

### Required Features
- **Node.js**: Version 14+ for backend server
- **npm**: For dependency management
- ES6+ JavaScript support
- Fetch API for streaming
- FileReader API for file uploads
- CSS Grid and Flexbox
- CSS Custom Properties

## 🔄 Updates and Maintenance

### Keeping Updated
- **Dependencies**: Run `npm update` to update Node.js dependencies (if using backend)
- **Backend Restart**: Restart server after updating `server.js` (if using backend)
- **Browser Cache**: Clear browser cache after frontend updates
- **Session Persistence**: Sessions automatically persist in localStorage

### Backup and Migration
- **Session Export**: Use JSON export from Settings panel for complete backup
- **localStorage Storage**: All sessions stored in browser localStorage by default
- **Optional Backend**: Use backend server for file-based storage and cross-device sync
- **Version Control**: Exported JSON files can be tracked in git repositories
- **Settings Migration**: Server/model settings automatically persist in localStorage

### Development
- **Frontend Changes**: Edit HTML/CSS/JS files, refresh browser
- **Backend Changes**: Restart Node.js server after modifying `server.js` (if using backend)
- **Testing**: Use browser developer tools for debugging
- **localStorage Inspection**: Check Application tab in developer tools for session data

### Project Structure for Version Control
```
# Recommended .gitignore entries
node_modules/
sessions/backup-*.json  # If using backend, ignore backup files
.DS_Store
```

## 🆘 Getting Help

### Resources
- **Ollama Documentation**: https://ollama.ai/docs
- **Model Library**: https://ollama.ai/library
- **GitHub Issues**: Report bugs and request features

### Community
- **Ollama Discord**: Join the official Ollama community
- **Reddit**: r/ollama subreddit for discussions
- **Stack Overflow**: Tag questions with `ollama`

### Reporting Issues
When reporting issues, please include:
1. Browser and version
2. Operating system
3. Ollama server version
4. Error messages from browser console
5. Steps to reproduce the problem

---

## 🎉 Enjoy Your Ollama Web UI!

You now have a fully-featured web interface for Ollama with:
- ✅ Beautiful, responsive design with uniform button styling
- ✅ File upload and vision model support  
- ✅ Real-time streaming responses
- ✅ Robust localStorage session management
- ✅ Clean startup with History panel for chat access
- ✅ Export/Import capabilities in Settings panel
- ✅ Conversation export to RTF
- ✅ Easy server configuration
- ✅ Mobile-friendly interface
- ✅ Optional backend server support

**Happy chatting with your AI models!** 🚀🤖
