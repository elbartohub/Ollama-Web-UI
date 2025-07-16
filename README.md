
# Ollama Web UI + RAG


A modern, feature-rich web interface for interacting with Ollama models. This enterprise-grade web UI provides a comprehensive chat experience with advanced RAG (Retrieval-Augmented Generation) capabilities, project-based vector database storage, robust session management, and extensive document processing features.

<img width="1280" height="811" alt="Screenshot 2025-07-17 at 2 49 23 AM" src="https://github.com/user-attachments/assets/09e53a96-6c25-4ffe-b45f-f462a6a511ea" />


A modern, responsive web interface for interacting with Ollama models. This web UI provides a clean chat interface with robust session management, localStorage persistence, RTF export functionality, and comprehensive code formatting capabilities.

**🎯 This project is a valuable resource for companies seeking a production-ready, enterprise-grade AI chat interface.** Built with modern web technologies and designed for real-world deployment, this solution offers everything businesses need: Whether you're a startup exploring AI capabilities or an enterprise scaling AI deployment, this web UI delivers the reliability, features, and user experience that modern organizations demand.

<img width="1190" height="761" alt="image" src="https://github.com/user-attachments/assets/80bb39df-7ebd-41d9-ba15-33db970f3b4d" />


## 🚀 Features

### 🧠 RAG (Retrieval-Augmented Generation) - **NEW**
- **📚 Multi-Format Document Support**: Upload and process PDF, CSV, JSON, and TXT files
- **🔍 Intelligent Vector Search**: Semantic search using Ollama embedding models (nomic-embed-text, mxbai-embed-large, all-minilm)
- **⚡ Smart Text Chunking**: Configurable chunk size (100-4000 tokens) with overlap support (0-500 tokens)
- **� Multi-language Processing**: Full Unicode support including Chinese, Japanese, Korean, and other languages
- **� Persistent Vector Database**: Auto-save to browser storage with file export/import capabilities
- **🎯 Context-Aware Conversations**: Automatic injection of relevant document context into AI responses
- **� Real-time Processing**: Live progress indicators and document processing status
- **🗂️ Document Management**: View, preview, and manage uploaded documents with detailed statistics

<img width="736" height="1092" alt="Screenshot 2025-07-17 at 2 44 15 AM" src="https://github.com/user-attachments/assets/24a06c10-5abd-4209-985e-cfaa4f6b9022" />


### Core Chat Functionality
- **🔧 Flexible Server Configuration**: Easy setup with custom Ollama server IP addresses
- **🤖 Dynamic Model Selection**: Auto-detection and selection from available Ollama models
- **📁 Advanced File Upload**: Support for images and documents with drag & drop interface
- **🌊 Real-time Streaming**: Live streaming responses with typing animations
- **💬 Modern Chat Interface**: Clean, responsive chat bubbles with timestamps
- **💻 Advanced Code Formatting**: Syntax highlighting for 100+ programming languages

### Session Management & Persistence
- **💾 Dual Storage System**: Browser localStorage with optional backend server integration
- **📱 Comprehensive History Panel**: Browse, search, and manage all chat sessions
- **🗂️ Advanced Session Controls**: Save, load, rename, delete with visual session indicators
- **📤 Import/Export Capabilities**: JSON-based session backup and restore functionality
- **⚡ Intelligent Auto-save**: Automatic session persistence after each interaction
- **🧠 Persistent System Prompts**: Customizable AI behavior with session-specific instructions
- **🔄 Cross-Device Sync**: Share sessions across devices with backend server (optional)

### Document Processing & Vector Database
- **🎯 Configurable Processing**: Adjustable chunk sizes, overlap ratios, and embedding models
- **� File-Based Persistence**: Export vector databases as timestamped JSON files
- **🔄 Database Portability**: Import/export complete vector databases between installations
- **📈 Processing Analytics**: Detailed statistics on documents, chunks, and embeddings
- **🗄️ Storage Management**: Clear storage, monitor usage, and optimize performance
- **⚙️ Model Flexibility**: Switch between different embedding models without reprocessing

### Advanced Features
- **📄 RTF Export**: Professional document export with Rich Text Format support
- **🧮 Mathematical Rendering**: KaTeX integration for complex mathematical expressions
- **🖼️ Vision Model Support**: Automatic detection and optimization for vision-capable models
- **📊 Real-time Status Monitoring**: Connection status, processing indicators, and error handling
- **🎨 Syntax Highlighting**: Advanced code block formatting with copy-to-clipboard functionality
- **🔔 Smart Notification System**: Toast notifications for user feedback and error reporting

### User Experience & Performance
- **🎨 Modern, Responsive Design**: Beautiful interface optimized for desktop and mobile
- **⚡ Optimized Performance**: Fast loading, smooth animations, and efficient processing
- **🎯 Accessibility Features**: Keyboard navigation and screen reader compatibility
- **🌅 Clean Interface**: Distraction-free design with contextual panel management
- **📱 Mobile-Friendly**: Responsive design that works across all device sizes

![Screenshot 2025-07-06 at 7 19 35 AM](https://github.com/user-attachments/assets/c277de37-578a-48ae-8bf1-8dbb1c56f74b)
![Screenshot 2025-07-06 at 7 23 43 AM](https://github.com/user-attachments/assets/cc81847f-d815-4490-b1cc-c03eb559df91)

## 📋 Requirements

### System Requirements
- **Modern Web Browser**: Chrome 80+, Firefox 75+, Safari 13+, or Edge 80+
- **Ollama Server**: Ollama installed and running (local or remote)
- **Models**: At least one Ollama model installed on your server
- **Network**: Proper network connectivity and CORS configuration for remote servers

### Recommended Ollama Models

**Text Models:**
```bash
ollama pull llama3.1        # General purpose conversations
ollama pull llama3.1:70b    # Higher quality responses (requires more resources)
ollama pull codellama       # Code-focused conversations
ollama pull mistral         # Fast, efficient responses
```

**Embedding Models (for RAG):**
```bash
ollama pull nomic-embed-text    # Default, fast embedding model
ollama pull mxbai-embed-large   # Higher quality embeddings
ollama pull all-minilm         # Lightweight embedding model
```

**Vision Models:**
```bash
ollama pull llava           # Vision + text capabilities
ollama pull llava:34b       # Higher quality vision model
```

## 🛠️ Installation & Setup

### Method 1: Direct File Access (Recommended)

**Quick Start - No Installation Required:**

1. **Download or Clone the Repository:**
   ```bash
   git clone https://github.com/elbartohub/Ollama-Web-UI.git
   cd Ollama-Web-UI
   ```

2. **Ensure Ollama is Running:**
   ```bash
   # Start Ollama server
   ollama serve
   
   # Pull a model if you haven't already
   ollama pull llama3.1
   ollama pull nomic-embed-text  # For RAG functionality
   ```

3. **Open the Interface:**
   - Simply open `index.html` in your web browser
   - All features work immediately
   - Sessions auto-save to browser localStorage
   - Vector database persists automatically

### Method 2: Backend Server (Optional Enhanced Features)

**For Additional Backend Features:**

1. **Install Dependencies:**
   ```bash
   cd Ollama-Web-UI
   npm install
   ```

2. **Start the Backend Server:**
   ```bash
   npm start
   # or
   node server.js
   ```

3. **Access the Interface:**
   - Open `http://localhost:3001` in your browser
   - Includes all features plus optional backend storage

### CORS Configuration (For Remote Servers)

**If your Ollama server is on a different machine:**

**Windows (Command Prompt as Administrator):**
```cmd
setx OLLAMA_ORIGINS "*" /M
setx OLLAMA_HOST "0.0.0.0:11434" /M
# Restart Ollama service
net stop ollama
net start ollama
```

**macOS/Linux:**
```bash
export OLLAMA_ORIGINS="*"
export OLLAMA_HOST="0.0.0.0:11434"
# Restart Ollama
killall ollama
ollama serve
```

**Docker (Alternative):**
```bash
docker run -d -v ollama:/root/.ollama -p 11434:11434 \
  -e OLLAMA_ORIGINS="*" \
  -e OLLAMA_HOST="0.0.0.0:11434" \
  --name ollama ollama/ollama
```

## 💬 Usage Guide

### Initial Setup

1. **Configure Server Connection:**
   - Click the gear icon (⚙️) in the top-right header
   - Enter your Ollama server URL (e.g., `http://192.168.1.100:11434`)
   - Select an available model from the dropdown
   - Optionally set a system prompt for AI behavior

2. **Test Connection:**
   - The connection status indicator shows real-time status
   - Green = Connected, Red = Disconnected
   - Send a test message to verify everything works

### 🧠 RAG (Document-Enhanced Conversations)

**Uploading and Processing Documents:**

1. **Access RAG Panel:**
   - Click the database icon (🗃️) in the header or the floating toggle button
   - The RAG panel slides in from the left

2. **Configure Processing Settings:**
   - **Chunk Size**: 100-4000 tokens (default: 1000)
   - **Chunk Overlap**: 0-500 tokens (default: 200)
   - **Embedding Model**: Choose from available models

3. **Upload Documents:**
   - Drag & drop files or click the upload area
   - Supported formats: PDF, CSV, JSON, TXT (including Chinese/Unicode)
   - Review selected files before processing
   - Click "Process Files" to start

4. **Monitor Processing:**
   - Real-time progress bar and status updates
   - Processing includes: text extraction → chunking → embedding generation
   - Large documents may take several minutes

5. **Document Management:**
   - View all processed documents in the document list
   - Preview document chunks and metadata
   - Remove individual documents or clear all

**Using RAG in Conversations:**

1. **Automatic Context Injection:**
   - When RAG documents are loaded, relevant context automatically enhances responses
   - The AI will reference your documents when answering questions
   - No special commands needed - just ask questions naturally

2. **Optimal Question Types:**
   - "What does the document say about...?"
   - "Summarize the key points from..."
   - "Find information related to..."
   - "Compare the data between..."

### 💾 Vector Database Management

**Persistent Storage Features:**

1. **Auto-Save (Automatic):**
   - Vector database automatically saves to project folder (`vector_storage/`)
   - Survives application restarts and system reboots
   - Requires backend server to be running

2. **Project Folder Storage:**
   - Click "Load from Project" to browse vector databases in the project folder
   - All vector databases stored in `vector_storage/` directory for organized management
   - Automatic persistence with organized file management
   - File browser with load/delete actions for project-stored databases
   - Perfect for team collaboration and cross-device access

3. **Export Database:**
   - Click "Export DB" in the RAG panel
   - Downloads timestamped JSON file (e.g., `ollama-rag-vectordb-2025-07-16.json`)
   - Contains all documents, chunks, embeddings, and settings

4. **Import Database:**
   - Click "Import DB" to load previously exported database
   - Replaces current database with imported data
   - Useful for sharing processed documents between systems

5. **Database Statistics:**
   - View document count, chunk count, and embedding statistics
   - Monitor storage usage and processing efficiency
   - Track chunk size and processing settings

### Session Management & Storage

**Session Controls:**

1. **Auto-Save Functionality:**
   - Every message automatically saves to the current session
   - Sessions persist across browser restarts
   - No manual saving required for basic usage

2. **History Panel Management:**
   - Click the history icon (🕒) to access all saved sessions
   - Browse sessions by date and preview content
   - Load any previous session to continue conversations

3. **Session Operations:**
   - **New Chat**: Start fresh conversation (previous session preserved)
   - **Save Session**: Manually save current conversation
   - **Load Session**: Resume any previous conversation
   - **Delete Session**: Remove unwanted conversations

4. **Import/Export Sessions:**
   - Export all sessions as JSON file for backup
   - Import sessions from backup files
   - Transfer conversations between devices/browsers

### Advanced Features

**File Upload & Vision:**

1. **Image Processing:**
   - Upload images directly in chat
   - Automatic vision model detection
   - Drag & drop or click to upload

2. **Document Upload:**
   - Support for various document formats
   - Automatic text extraction and processing
   - Preview uploaded content before sending

**Mathematical & Code Support:**

1. **Math Rendering:**
   - LaTeX equations automatically rendered with KaTeX
   - Supports complex mathematical expressions
   - Real-time rendering in chat responses

2. **Code Highlighting:**
   - Automatic language detection for code blocks
   - Syntax highlighting for 100+ programming languages
   - Copy-to-clipboard functionality

**Export & Sharing:**

1. **RTF Export:**
   - Save individual conversations as Rich Text Format
   - Preserves formatting, timestamps, and structure
   - Compatible with word processors

2. **Configuration Management:**
   - Save/load complete application settings
   - Share configurations between team members
   - Backup important settings

### Best Practices

**RAG Document Management:**

1. **Optimal Document Sizes:**
   - Keep individual documents under 10MB for best performance
   - Break large documents into logical sections
   - Use descriptive filenames for easy identification

2. **Chunk Size Guidelines:**
   - **Small chunks (100-500)**: Better for specific fact retrieval
   - **Large chunks (1000-2000)**: Better for context and summaries
   - **Overlap**: Use 10-20% of chunk size for smooth transitions

3. **Embedding Model Selection:**
   - **nomic-embed-text**: Fast, good for general use
   - **mxbai-embed-large**: Higher quality, slower processing
   - **all-minilm**: Lightweight, good for simple documents

**Performance Optimization:**

1. **Browser Storage:**
   - Monitor localStorage usage in browser developer tools
   - Export large vector databases to files regularly
   - Clear old sessions and documents when not needed

2. **Processing Efficiency:**
   - Process documents in batches rather than individually
   - Use appropriate chunk sizes for your content type
   - Consider network speed when using remote Ollama servers

**Security Considerations:**

1. **Data Privacy:**
   - All processing happens locally or on your Ollama server
   - No data sent to external services
   - Vector databases stored locally in browser

2. **Network Security:**
   - Use HTTPS when possible for remote connections
   - Ensure Ollama server is properly secured
   - Consider VPN for remote server access
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

### 📚 RAG (Retrieval-Augmented Generation)

The RAG system enhances AI responses with context from uploaded documents:

**📥 Getting Started with RAG:**
1. **Install Embedding Model**: 
   ```bash
   ollama pull nomic-embed-text  # Default embedding model
   # or choose alternatives:
   ollama pull mxbai-embed-large  # Higher accuracy
   ollama pull all-minilm         # Faster processing
   ```

2. **Open RAG Panel**: Click the database icon (📊) in the header or the floating toggle button

3. **Configure Settings**:
   - **Chunk Size**: 1000 characters (recommended for most documents)
   - **Chunk Overlap**: 200 characters (maintains context between chunks)
   - **Embedding Model**: Choose based on accuracy vs. speed needs

4. **Upload Documents**: 
   - **Supported formats**: PDF*, CSV, JSON, TXT (including Chinese/Unicode)
   - **Multiple files**: Upload related documents together for better context
   - **Processing**: Documents are automatically chunked and embedded

5. **Enhanced Conversations**: 
   - Ask questions about your documents
   - Get responses with relevant context automatically injected
   - View retrieved context chunks in the chat interface

**📄 File Format Support:**
- **TXT**: Plain text, Unicode/Chinese support ✅
- **CSV**: Automatic header detection and row parsing ✅  
- **JSON**: Hierarchical structure preservation ✅
- **PDF**: Requires additional setup* (see RAG_README.md for details)

*PDF processing requires PDF.js library or server-side conversion to TXT format.

**🔧 RAG Configuration Tips:**
- **Small Documents** (< 5 pages): Use smaller chunks (500-800 chars)
- **Large Documents** (> 20 pages): Use larger chunks (1200-1500 chars)  
- **Technical Content**: Higher overlap (300-400 chars) for better context
- **Multiple Languages**: `nomic-embed-text` works well with mixed content

For detailed RAG setup and troubleshooting, see [RAG_README.md](RAG_README.md).

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

## 🏗️ Technical Architecture

### System Components

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Web Browser   │────│  Ollama Web UI   │────│  Ollama Server  │
│                 │    │                  │    │                 │
│ • localStorage  │    │ • RAG Processor  │    │ • LLM Models    │
│ • Vector DB     │    │ • Chat Interface │    │ • Embeddings    │
│ • Sessions      │    │ • File Processor │    │ • API Server    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Core Modules

**Frontend Components:**
- `index.html` - Main application interface
- `script.js` - Core application logic and API interactions
- `styles.css` - Main application styling
- `rag-styles.css` - RAG-specific interface styling

**RAG System:**
- `rag-processor.js` - Document processing and vector search engine
- `pdf-processor.js` - PDF text extraction utilities
- `chat-storage.js` - Session management and persistence

**Backend (Optional):**
- `server.js` - Express.js server for enhanced features
- `package.json` - Node.js dependencies and scripts

### Data Flow Architecture

**RAG Processing Pipeline:**
```
Document Upload → Text Extraction → Chunking → Embedding → Vector Storage
                                                    ↓
Query Input → Query Embedding → Similarity Search → Context Retrieval → AI Response
```

**Session Management:**
```
User Interaction → Auto-save → localStorage → Optional Backend → Export/Import
```

## 📁 File Structure

```
Ollama-Web-UI/
├── index.html              # Main application interface
├── script.js               # Core application logic
├── styles.css              # Main styling
├── rag-styles.css          # RAG interface styling
├── rag-processor.js        # RAG processing engine
├── pdf-processor.js        # PDF processing utilities
├── chat-storage.js         # Session management
├── server.js               # Optional backend server
├── package.json            # Node.js configuration
├── README.md               # This documentation
├── VECTOR_DATABASE.md      # Vector database documentation
├── RAG_README.md           # RAG system documentation
├── sessions/               # Backend session storage (auto-created)
│   ├── config.json         # Server configuration
│   └── sessions.json       # Session backup
└── vector_storage/         # Vector database project storage (auto-created)
    └── *.json              # Timestamped vector database files
```

## 🔧 Configuration & Deployment

### Environment Variables (Backend)

```bash
# Server Configuration
PORT=3001                    # Backend server port
OLLAMA_BASE_URL=http://localhost:11434  # Default Ollama server

# Storage Configuration
SESSION_STORAGE_PATH=./sessions         # Session storage directory
MAX_SESSION_SIZE=10MB                   # Maximum session file size
```

### Production Deployment

**Static Hosting (Recommended):**
- No build process required - upload files directly
- Works with GitHub Pages, Netlify, Vercel
- Ensure Ollama server has proper CORS configuration

**Docker Deployment:**
```dockerfile
FROM nginx:alpine
COPY . /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Backend Server Deployment:**
```bash
# Install PM2 for production
npm install -g pm2
pm2 start server.js --name ollama-web-ui
```

## 🔒 Security & Performance

### Security Considerations

**Data Privacy:**
- All processing happens locally or on your Ollama server
- No data sent to external services
- Vector databases stored locally in browser
- Sessions remain private and secure

**Network Security:**
- Use HTTPS when possible for remote connections
- Implement proper CORS configuration
- Consider VPN for remote server access
- Regular security updates for server components

### Performance Optimization

**Memory Management:**
- Vector embeddings cached efficiently in browser
- Automatic cleanup of old sessions
- Optimized chunk processing for large documents

**Storage Management:**
- Monitor localStorage usage in browser developer tools
- Export large vector databases to files regularly
- Clear old sessions and documents when not needed

## 🛠️ Troubleshooting

### Common Issues

**Connection Problems:**
- Verify Ollama server is running: `curl http://localhost:11434/api/tags`
- Check CORS configuration for remote servers
- Verify network connectivity and firewall settings

**RAG Performance Issues:**
- Use appropriate chunk sizes for your content type
- Consider network speed when using remote Ollama servers
- Monitor browser storage limits for large vector databases

**File Processing Problems:**
- Check file size limits and format support
- Verify sufficient browser storage space
- Ensure proper Unicode encoding for international content

### Development Guidelines

**Browser Developer Tools:**
```javascript
// Check localStorage usage
console.log(Object.keys(localStorage));

// Monitor vector database size
console.log(localStorage.getItem('ollama-rag-backup')?.length);

// Debug RAG processing
ragProcessor.getStats();
```

**Code Style:**
- Use consistent indentation (2 spaces)
- Follow existing naming conventions
- Add comments for complex RAG logic
- Test across different browsers and document types

## 🤝 Contributing & Support

### Getting Help
- **Documentation**: Check `VECTOR_DATABASE.md` and `RAG_README.md` for detailed technical information
- **GitHub Issues**: Report bugs and request features
- **Discussions**: Join the community for questions and tips
- **Ollama Discord**: Connect with the broader Ollama community

### Contributing Guidelines
1. Fork the repository and create feature branches
2. Follow existing code style and conventions
3. Test thoroughly with various document types and models
4. Document new RAG features and configuration options
5. Submit pull requests with detailed descriptions

### Reporting Issues
When reporting issues, please include:
1. Browser and version
2. Operating system  
3. Ollama server version and models
4. Application configuration (chunk size, embedding model, etc.)
5. Error messages from browser console
6. Vector database size and document types (for RAG issues)
7. Steps to reproduce the problem

---

## 🎉 Enjoy Your Advanced Ollama Web UI!

You now have a comprehensive, enterprise-grade web interface for Ollama featuring:

### ✅ **Core Features**
- Beautiful, responsive design optimized for all devices
- Real-time streaming responses with typing animations
- Advanced file upload with drag & drop support
- Vision model integration for image processing
- Mathematical equation rendering with KaTeX
- Syntax highlighting for 100+ programming languages

### ✅ **RAG Capabilities**
- Multi-format document processing (PDF, CSV, JSON, TXT)
- Intelligent vector search with configurable embedding models
- Persistent vector database with auto-save and export/import
- Multi-language support including Chinese, Japanese, Korean
- Real-time document processing with progress indicators
- Context-aware conversations with automatic document integration

### ✅ **Session Management**
- Dual storage system (localStorage + optional backend)
- Comprehensive session history with search and management
- Auto-save functionality with manual session controls
- JSON-based import/export for backup and sharing
- Cross-device synchronization with backend server

### ✅ **Enterprise Features**
- Configuration management with import/export capabilities
- Real-time connection monitoring and error handling
- Advanced security considerations for production use
- Scalable architecture supporting multiple deployment options
- Professional RTF export for document sharing

**Start building amazing AI-powered applications with document intelligence!** 🚀🤖📚
