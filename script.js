// Global variables
let currentModel = '';
let serverUrl = 'http://192.168.68.30:11434';
let models = [];
let uploadedFiles = [];
let isStreaming = false;
let systemPrompt = '';

// Session management variables
let currentSessionId = null;
let sessions = {};
let autoSaveEnabled = true;

// Chat storage instance
let chatStorage = null;

// Backend server URL
const BACKEND_URL = 'http://localhost:3001';

// Configure DOMPurify to allow think tags and data attributes
const domPurifyConfig = {
    ALLOWED_TAGS: ['#text', 'p', 'br', 'strong', 'em', 'u', 'i', 'b', 'code', 'pre', 'blockquote', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'a', 'img', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'span', 'div', 'think'],
    ALLOWED_ATTR: ['href', 'title', 'alt', 'src', 'class', 'id', 'style', 'data-language'],
    KEEP_CONTENT: true
};

// Configure marked.js with custom renderer for code blocks
marked.setOptions({
    breaks: true,
    gfm: true
});

// Custom renderer for code blocks to add language attributes
const renderer = new marked.Renderer();

// Override the code method with extra safety checks
renderer.code = function(code, language, escaped) {
    // Log everything for debugging
    console.log('=== RENDERER DEBUGGING ===');
    console.log('Raw code parameter:', code);
    console.log('Code type:', typeof code);
    console.log('Language:', language);
    console.log('Escaped:', escaped);
    console.log('Code constructor:', code ? code.constructor.name : 'null');
    
    // Handle different types of code input
    let finalCode = '';
    
    if (code === null || code === undefined) {
        finalCode = '';
        console.log('Code is null/undefined');
    } else if (typeof code === 'string') {
        finalCode = code;
        console.log('Code is string, length:', finalCode.length);
    } else if (Array.isArray(code)) {
        finalCode = code.join('\n');
        console.log('Code is array, joined to string');
    } else if (typeof code === 'object') {
        console.error('Code is object! Inspecting:', code);
        // Try different properties that might contain the actual code
        if (code.text) {
            finalCode = String(code.text);
        } else if (code.content) {
            finalCode = String(code.content);
        } else if (code.value) {
            finalCode = String(code.value);
        } else {
            // Last resort - convert to JSON
            finalCode = JSON.stringify(code);
        }
    } else {
        finalCode = String(code);
        console.log('Code converted to string from type:', typeof code);
    }
    
    console.log('Final code content preview:', finalCode.substring(0, 100) + '...');
    
    const lang = language || '';
    const langAttr = lang ? ` data-language="${lang}"` : '';
    
    // Don't escape if already escaped, otherwise escape
    const safeCode = escaped ? finalCode : escapeHtml(finalCode);
    
    console.log('=== END RENDERER DEBUGGING ===');
    return `<pre${langAttr}><code>${safeCode}</code></pre>`;
};

// Set the custom renderer
marked.use({ renderer });

// HTML escape function for code content
function escapeHtml(text) {
    if (typeof text !== 'string') {
        text = String(text);
    }
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

async function initializeApp() {
    // Initialize chat storage
    if (typeof ChatStorage !== 'undefined') {
        chatStorage = new ChatStorage();
        console.log('Chat storage initialized');
    }
    
    // Load saved settings from backend first, fallback to localStorage
    await loadConfigurationOnStartup();
    
    // Load saved sessions from backend and localStorage
    await loadSessions();
    
    // Load chat history from local storage (this will populate History panel)
    loadChatHistoryOnStartup();
    
    // Ensure chat area starts clean with welcome message
    ensureWelcomeMessage();
    
    // Set up event listeners
    setupEventListeners();
    
    // Auto-resize textarea
    autoResizeTextarea();
    
    // Update session info
    updateCurrentSessionInfo();
}

function ensureWelcomeMessage() {
    const chatContainer = document.getElementById('chatContainer');
    if (!chatContainer) return;
    
    // Clear any existing content
    chatContainer.innerHTML = '';
    
    // Add welcome message
    const welcomeMessage = document.createElement('div');
    welcomeMessage.className = 'welcome-message';
    welcomeMessage.innerHTML = `
        <i class="fas fa-comments"></i>
        <h2>Welcome to Ollama Web UI</h2>
        <p>Configure your server settings and select a model to start chatting</p>
        <p>Access your previous conversations through the History panel</p>
    `;
    
    chatContainer.appendChild(welcomeMessage);
}

async function loadConfigurationOnStartup() {
    try {
        // Try to load from backend first
        const response = await fetch(`${BACKEND_URL}/api/config`);
        
        if (response.ok) {
            const config = await response.json();
            
            // Update variables and UI with backend config
            if (config.serverUrl) {
                document.getElementById('serverIp').value = config.serverUrl;
                serverUrl = config.serverUrl;
            }
            
            if (config.model) {
                currentModel = config.model;
            }
            
            if (config.systemPrompt) {
                document.getElementById('systemPrompt').value = config.systemPrompt;
                systemPrompt = config.systemPrompt;
            }
            
            console.log('Configuration loaded from backend on startup:', config);
        } else {
            throw new Error('Backend not available');
        }
    } catch (error) {
        console.log('Backend not available, loading from localStorage:', error.message);
        // Fallback to localStorage if backend is not available
        loadSettingsFromLocalStorage();
    }
    
    // Load models after configuration is set
    await loadModels();
}

function loadSettingsFromLocalStorage() {
    const savedServerUrl = localStorage.getItem('ollamaServerUrl');
    const savedModel = localStorage.getItem('ollamaModel');
    const savedSystemPrompt = localStorage.getItem('ollamaSystemPrompt');
    
    if (savedServerUrl) {
        document.getElementById('serverIp').value = savedServerUrl;
        serverUrl = savedServerUrl;
    }
    
    if (savedModel) {
        currentModel = savedModel;
    }
    
    if (savedSystemPrompt) {
        document.getElementById('systemPrompt').value = savedSystemPrompt;
        systemPrompt = savedSystemPrompt;
    }
}

function saveSettings() {
    // Save to localStorage for offline fallback
    localStorage.setItem('ollamaServerUrl', serverUrl);
    localStorage.setItem('ollamaModel', currentModel);
    localStorage.setItem('ollamaSystemPrompt', systemPrompt);
    
    // Also save to backend (non-blocking)
    saveSettingsToBackend();
}

async function saveSettingsToBackend() {
    try {
        const config = {
            serverUrl: serverUrl,
            model: currentModel,
            systemPrompt: systemPrompt
        };

        const response = await fetch(`${BACKEND_URL}/api/config`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(config)
        });

        if (response.ok) {
            console.log('Settings auto-saved to backend');
        }
    } catch (error) {
        console.log('Could not auto-save settings to backend:', error.message);
    }
}

// Configuration Management Functions
async function saveConfiguration() {
    try {
        const config = {
            serverUrl: serverUrl,
            model: currentModel,
            systemPrompt: systemPrompt
        };

        const response = await fetch(`${BACKEND_URL}/api/config`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(config)
        });

        if (response.ok) {
            const result = await response.json();
            showNotification('Configuration saved successfully!', 'success');
            console.log('Configuration saved:', result.config);
        } else {
            throw new Error('Failed to save configuration');
        }
    } catch (error) {
        console.error('Error saving configuration:', error);
        showNotification('Failed to save configuration. Please check if the backend server is running.', 'error');
    }
}

async function loadConfiguration() {
    try {
        const response = await fetch(`${BACKEND_URL}/api/config`);
        
        if (response.ok) {
            const config = await response.json();
            
            // Update UI and variables with loaded config
            document.getElementById('serverIp').value = config.serverUrl || serverUrl;
            serverUrl = config.serverUrl || serverUrl;
            
            currentModel = config.model || currentModel;
            
            document.getElementById('systemPrompt').value = config.systemPrompt || '';
            systemPrompt = config.systemPrompt || '';
            
            // Save to localStorage for consistency
            saveSettings();
            
            // Reload models with new server URL
            await loadModels();
            
            // Update model selection if model was loaded
            if (config.model) {
                const modelSelect = document.getElementById('modelSelect');
                if (modelSelect.querySelector(`option[value="${config.model}"]`)) {
                    modelSelect.value = config.model;
                    updateModelInfo();
                }
            }
            
            showNotification('Configuration loaded successfully!', 'success');
            console.log('Configuration loaded:', config);
        } else {
            throw new Error('Failed to load configuration');
        }
    } catch (error) {
        console.error('Error loading configuration:', error);
        showNotification('Failed to load configuration. Using default settings.', 'warning');
    }
}

async function exportConfiguration() {
    try {
        const response = await fetch(`${BACKEND_URL}/api/config/export`);
        
        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `ollama-config-${new Date().toISOString().slice(0, 10)}.json`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
            showNotification('Configuration exported successfully!', 'success');
        } else {
            throw new Error('Failed to export configuration');
        }
    } catch (error) {
        console.error('Error exporting configuration:', error);
        showNotification('Failed to export configuration. Please check if the backend server is running.', 'error');
    }
}

function importConfiguration() {
    const fileInput = document.getElementById('configFileInput');
    fileInput.click();
}

async function handleConfigFileImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    try {
        const text = await file.text();
        const config = JSON.parse(text);
        
        const response = await fetch(`${BACKEND_URL}/api/config/import`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(config)
        });

        if (response.ok) {
            const result = await response.json();
            
            // Load the imported configuration
            await loadConfiguration();
            
            showNotification('Configuration imported successfully!', 'success');
            console.log('Configuration imported:', result.config);
        } else {
            throw new Error('Failed to import configuration');
        }
        
        // Clear the file input
        event.target.value = '';
    } catch (error) {
        console.error('Error importing configuration:', error);
        if (error instanceof SyntaxError) {
            showNotification('Invalid configuration file. Please select a valid JSON file.', 'error');
        } else {
            showNotification('Failed to import configuration. Please check if the backend server is running.', 'error');
        }
        
        // Clear the file input
        event.target.value = '';
    }
}

function setupEventListeners() {
    // Server IP change
    document.getElementById('serverIp').addEventListener('change', function() {
        serverUrl = this.value;
        saveSettings();
        loadModels();
    });
    
    // Model selection change
    document.getElementById('modelSelect').addEventListener('change', function() {
        currentModel = this.value;
        saveSettings();
        updateModelInfo();
    });
    
    // System prompt change
    document.getElementById('systemPrompt').addEventListener('input', function() {
        systemPrompt = this.value;
        saveSettings();
    });
    
    // Message input
    const messageInput = document.getElementById('messageInput');
    messageInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    // File input
    document.getElementById('fileInput').addEventListener('change', handleFileUpload);
    
    // Drag and drop for files
    const chatContainer = document.getElementById('chatContainer');
    chatContainer.addEventListener('dragover', function(e) {
        e.preventDefault();
        chatContainer.style.backgroundColor = '#f0f8ff';
    });
    
    chatContainer.addEventListener('dragleave', function(e) {
        e.preventDefault();
        chatContainer.style.backgroundColor = '';
    });
    
    chatContainer.addEventListener('drop', function(e) {
        e.preventDefault();
        chatContainer.style.backgroundColor = '';
        const files = Array.from(e.dataTransfer.files);
        handleFiles(files);
    });
    
    // Add click handler for code block copy functionality
    document.addEventListener('click', handleCodeBlockCopy);
}

function autoResizeTextarea() {
    const textarea = document.getElementById('messageInput');
    textarea.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 120) + 'px';
    });
}

function toggleSettings() {
    const settingsPanel = document.getElementById('settingsPanel');
    settingsPanel.classList.toggle('active');
    
    // Update storage info when opening settings
    if (settingsPanel.classList.contains('active')) {
        setTimeout(updateStorageInfo, 100);
    }
}

async function loadModels() {
    const modelSelect = document.getElementById('modelSelect');
    const connectionStatus = document.getElementById('connectionStatus');
    
    connectionStatus.className = 'connection-status connecting';
    connectionStatus.innerHTML = '<i class="fas fa-circle"></i> Connecting...';
    
    try {
        const response = await fetch(`${serverUrl}/api/tags`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            mode: 'cors', // Enable CORS
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        models = data.models || [];
        
        // Clear and populate model select
        modelSelect.innerHTML = '';
        
        if (models.length === 0) {
            modelSelect.innerHTML = '<option value="">No models available</option>';
            connectionStatus.className = 'connection-status connected';
            connectionStatus.innerHTML = '<i class="fas fa-circle"></i> Connected (No models)';
        } else {
            models.forEach(model => {
                const option = document.createElement('option');
                option.value = model.name;
                option.textContent = `${model.name} (${formatBytes(model.size)})`;
                modelSelect.appendChild(option);
            });
            
            // Select previously chosen model or first available
            if (currentModel && models.find(m => m.name === currentModel)) {
                modelSelect.value = currentModel;
            } else if (models.length > 0) {
                modelSelect.value = models[0].name;
                currentModel = models[0].name;
                saveSettings();
            }
            
            connectionStatus.className = 'connection-status connected';
            connectionStatus.innerHTML = '<i class="fas fa-circle"></i> Connected';
            updateModelInfo();
        }
        
    } catch (error) {
        console.error('Error loading models:', error);
        modelSelect.innerHTML = '<option value="">Connection failed</option>';
        connectionStatus.className = 'connection-status disconnected';
        
        // More detailed error messages
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            connectionStatus.innerHTML = '<i class="fas fa-circle"></i> Network error - Check server address';
        } else if (error.message.includes('CORS')) {
            connectionStatus.innerHTML = '<i class="fas fa-circle"></i> CORS error - Server needs CORS configuration';
        } else {
            connectionStatus.innerHTML = '<i class="fas fa-circle"></i> Connection failed - ' + error.message;
        }
    }
}

function updateModelInfo() {
    const selectedModel = models.find(m => m.name === currentModel);
    if (selectedModel) {
        // You can add model capability detection here
        // For now, we'll assume vision models contain certain keywords
        const isVisionModel = currentModel.toLowerCase().includes('vision') || 
                             currentModel.toLowerCase().includes('llava') ||
                             currentModel.toLowerCase().includes('minicpm');
        
        console.log(`Selected model: ${currentModel}, Vision support: ${isVisionModel}`);
    }
}

function handleFileUpload(event) {
    const files = Array.from(event.target.files);
    handleFiles(files);
}

function handleFiles(files) {
    const fileUploadArea = document.getElementById('fileUploadArea');
    const uploadPreview = document.getElementById('uploadPreview');
    
    files.forEach(file => {
        // Check file type and size
        if (file.size > 10 * 1024 * 1024) { // 10MB limit
            alert(`File "${file.name}" is too large. Maximum size is 10MB.`);
            return;
        }
        
        const fileObj = {
            file: file,
            id: Date.now() + Math.random(),
            type: file.type
        };
        
        uploadedFiles.push(fileObj);
        
        // Create preview element
        const uploadItem = document.createElement('div');
        uploadItem.className = 'upload-item';
        uploadItem.dataset.fileId = fileObj.id;
        
        // Add file icon or image preview
        if (file.type.startsWith('image/')) {
            const img = document.createElement('img');
            img.src = URL.createObjectURL(file);
            uploadItem.appendChild(img);
        } else {
            const icon = document.createElement('i');
            icon.className = getFileIcon(file.type);
            uploadItem.appendChild(icon);
        }
        
        // Add file name
        const fileName = document.createElement('span');
        fileName.textContent = file.name;
        uploadItem.appendChild(fileName);
        
        // Add remove button
        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-file';
        removeBtn.innerHTML = '×';
        removeBtn.onclick = () => removeFile(fileObj.id);
        uploadItem.appendChild(removeBtn);
        
        uploadPreview.appendChild(uploadItem);
    });
    
    if (uploadedFiles.length > 0) {
        fileUploadArea.classList.add('active');
    }
    
    // Clear file input
    document.getElementById('fileInput').value = '';
}

function removeFile(fileId) {
    uploadedFiles = uploadedFiles.filter(f => f.id !== fileId);
    
    const uploadItem = document.querySelector(`[data-file-id="${fileId}"]`);
    if (uploadItem) {
        uploadItem.remove();
    }
    
    if (uploadedFiles.length === 0) {
        document.getElementById('fileUploadArea').classList.remove('active');
    }
}

function getFileIcon(fileType) {
    if (fileType.startsWith('image/')) return 'fas fa-image';
    if (fileType.includes('pdf')) return 'fas fa-file-pdf';
    if (fileType.includes('text')) return 'fas fa-file-text';
    if (fileType.includes('word')) return 'fas fa-file-word';
    return 'fas fa-file';
}

async function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const message = messageInput.value.trim();
    
    if (!message && uploadedFiles.length === 0) return;
    if (!currentModel) {
        alert('Please select a model first');
        return;
    }
    if (isStreaming) return;
    
    // Clear input
    messageInput.value = '';
    messageInput.style.height = 'auto';
    
    // Add user message to chat
    addMessage('user', message, uploadedFiles);
    
    // Clear uploaded files
    const currentFiles = [...uploadedFiles];
    uploadedFiles = [];
    document.getElementById('fileUploadArea').classList.remove('active');
    document.getElementById('uploadPreview').innerHTML = '';
    
    // Show loading and disable send button
    document.getElementById('sendBtn').disabled = true;
    isStreaming = true;
    
    try {
        await streamResponse(message, currentFiles);
    } catch (error) {
        console.error('Error sending message:', error);
        addMessage('assistant', 'Sorry, there was an error processing your message. Please check your connection and try again.');
    } finally {
        document.getElementById('sendBtn').disabled = false;
        isStreaming = false;
    }
}

async function streamResponse(message, files) {
    // Build conversation context from previous messages
    const previousMessages = getCurrentMessages();
    let contextPrompt = '';
    
    // Add system prompt if available
    if (systemPrompt && systemPrompt.trim()) {
        contextPrompt += `System: ${systemPrompt.trim()}\n\n`;
    }
    
    // Build conversation history (excluding the current message we just added)
    if (previousMessages.length > 1) {
        // Get all messages except the last one (which is the current user message)
        const historyMessages = previousMessages.slice(0, -1);
        
        historyMessages.forEach(msg => {
            if (msg.role === 'You') {
                // Extract plain text from HTML content for user messages
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = msg.content;
                const plainText = tempDiv.textContent || tempDiv.innerText || '';
                contextPrompt += `User: ${plainText}\n\n`;
            } else if (msg.role === 'Assistant') {
                // Extract plain text from HTML content for assistant messages
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = msg.content;
                const plainText = tempDiv.textContent || tempDiv.innerText || '';
                contextPrompt += `Assistant: ${plainText}\n\n`;
            }
        });
    }
    
    // Add current user message
    contextPrompt += `User: ${message}`;
    
    // Prepare the request body with full context
    const requestBody = {
        model: currentModel,
        prompt: contextPrompt,
        stream: true
    };
    
    // Add system prompt as context if available
    if (systemPrompt && systemPrompt.trim()) {
        requestBody.system = systemPrompt.trim();
    }
    
    // Handle file uploads for vision models
    if (files.length > 0) {
        const images = [];
        
        for (const fileObj of files) {
            if (fileObj.file.type.startsWith('image/')) {
                const base64 = await fileToBase64(fileObj.file);
                images.push(base64.split(',')[1]); // Remove data:image/jpeg;base64, prefix
            }
        }
        
        if (images.length > 0) {
            requestBody.images = images;
        }
    }
    
    // Create assistant message element
    const assistantMessageId = 'msg_' + Date.now();
    addMessage('assistant', '', [], assistantMessageId);
    
    try {
        const response = await fetch(`${serverUrl}/api/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        
        const assistantMessageElement = document.getElementById(assistantMessageId);
        const contentElement = assistantMessageElement.querySelector('.message-content');
        let fullResponse = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
                if (line.trim() === '') continue;
                
                try {
                    const data = JSON.parse(line);
                    if (data.response) {
                        fullResponse += data.response;
                        contentElement.textContent = fullResponse;
                    }
                } catch (e) {
                    console.warn('Failed to parse JSON:', line);
                }
            }
        }

        // Final markdown rendering with error handling
        try {
            const processedResponse = preprocessContent(fullResponse);
            console.log('Processing response:', processedResponse.substring(0, 200) + '...');
            
            const renderedContent = marked.parse(processedResponse);
            console.log('Rendered content:', renderedContent.substring(0, 200) + '...');
            
            contentElement.innerHTML = DOMPurify.sanitize(renderedContent, domPurifyConfig);
        } catch (renderError) {
            console.error('Error rendering content:', renderError);
            // Fallback to plain text if rendering fails
            contentElement.textContent = fullResponse;
        }
        
        // Render math equations
        setTimeout(() => renderMathInContent(contentElement), 100);
        
        // Auto-save session after receiving response
        setTimeout(() => autoSaveSession(), 100);

    } catch (error) {
        console.error('Error during streaming:', error);
        const assistantMessageElement = document.getElementById(assistantMessageId);
        if (assistantMessageElement) {
            assistantMessageElement.querySelector('.message-content').textContent = 'Error: ' + error.message;
        }
    }
}

function addMessage(role, content, files = [], messageId = null) {
    const chatContainer = document.getElementById('chatContainer');
    const welcomeMessage = chatContainer.querySelector('.welcome-message');
    if (welcomeMessage) {
        welcomeMessage.remove();
    }
    
    const messageElement = document.createElement('div');
    messageElement.className = `message ${role}`;
    messageElement.id = messageId || `msg_${Date.now()}`;
    
    const roleElement = document.createElement('div');
    roleElement.className = 'role';
    roleElement.textContent = role === 'user' ? 'You' : 'Assistant';
    messageElement.appendChild(roleElement);
    
    const contentElement = document.createElement('div');
    contentElement.className = 'message-content';
    if (content) {
        const processedContent = preprocessContent(content);
        contentElement.innerHTML = DOMPurify.sanitize(marked.parse(processedContent), domPurifyConfig);
        // Render math equations after content is added
        setTimeout(() => renderMathInContent(contentElement), 100);
    }
    messageElement.appendChild(contentElement);
    
    if (files.length > 0) {
        const filesContainer = document.createElement('div');
        filesContainer.className = 'files';
        files.forEach(fileObj => {
            const fileElement = document.createElement('div');
            fileElement.className = 'file';
            fileElement.textContent = fileObj.file.name;
            filesContainer.appendChild(fileElement);
        });
        messageElement.appendChild(filesContainer);
    }
    
    const timestampElement = document.createElement('div');
    timestampElement.className = 'timestamp';
    timestampElement.textContent = new Date().toLocaleTimeString();
    messageElement.appendChild(timestampElement);
    
    chatContainer.appendChild(messageElement);
    chatContainer.scrollTop = chatContainer.scrollHeight;
    
    // Auto-save session after adding message
    setTimeout(autoSaveSession, 100);
    
    // Auto-save chat history to local storage
    setTimeout(saveChatHistoryAuto, 200);
}

// Math rendering helper function
function renderMathInContent(element) {
    // Wait for KaTeX to load, then render math
    if (typeof window.renderMathInElement === 'function') {
        try {
            window.renderMathInElement(element, {
                delimiters: [
                    {left: '$$', right: '$$', display: true},
                    {left: '$', right: '$', display: false},
                    {left: '\\(', right: '\\)', display: false},
                    {left: '\\[', right: '\\]', display: true}
                ],
                throwOnError: false,
                errorColor: '#cc0000',
                strict: false
            });
        } catch (error) {
            console.warn('Math rendering error:', error);
        }
    } else {
        // Retry after KaTeX loads
        setTimeout(() => renderMathInContent(element), 500);
    }
}

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function startNewChat() {
    // Confirm if there are existing messages
    const messages = document.querySelectorAll('.message');
    if (messages.length > 0) {
        const confirmed = confirm('Start a new chat? This will clear the current conversation.');
        if (!confirmed) {
            return;
        }
    }
    
    // Clear the chat container and restore welcome message
    ensureWelcomeMessage();
    
    // Clear any uploaded files
    uploadedFiles = [];
    const fileUploadArea = document.getElementById('fileUploadArea');
    const uploadPreview = document.getElementById('uploadPreview');
    fileUploadArea.classList.remove('active');
    uploadPreview.innerHTML = '';
    
    // Clear file input
    document.getElementById('fileInput').value = '';
    
    // Clear message input
    const messageInput = document.getElementById('messageInput');
    messageInput.value = '';
    messageInput.style.height = 'auto';
    
    // Reset streaming state
    isStreaming = false;
    document.getElementById('sendBtn').disabled = false;
    
    // Start a new session (don't clear all sessions)
    currentSessionId = null;
    updateCurrentSessionInfo();
    updateHistoryPanel(); // Update to reflect the current session change
    
    // Show notification
    showNotification('New chat started!', 'success');
}

// Session management functions
async function loadSessions() {
    console.log('=== LOADING SESSIONS ===');
    
    try {
        // First try to load from backend
        const response = await fetch(`${BACKEND_URL}/api/sessions`);
        if (response.ok) {
            sessions = await response.json();
            console.log('Sessions loaded from backend:', Object.keys(sessions).length, 'sessions');
        } else {
            throw new Error('Backend not available');
        }
    } catch (error) {
        console.log('Backend not available, loading sessions from localStorage:', error.message);
        // Fallback to localStorage if backend is not available
        if (chatStorage) {
            const localSessions = chatStorage.loadSessions();
            sessions = localSessions || {};
            console.log('Sessions loaded from localStorage:', Object.keys(sessions).length, 'sessions');
            console.log('LocalStorage sessions:', sessions);
        } else {
            console.log('No chatStorage available');
            sessions = {};
        }
    }
    
    // Always update history panel after loading sessions
    updateHistoryPanel();
    console.log('=== SESSIONS LOADED ===');
}

async function saveSessions() {
    let backendSuccess = false;
    let localStorageSuccess = false;
    
    // Try to save to backend first
    try {
        const response = await fetch(`${BACKEND_URL}/api/sessions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(sessions)
        });
        
        if (response.ok) {
            console.log('Sessions saved to backend');
            backendSuccess = true;
        } else {
            throw new Error('Failed to save sessions to backend');
        }
    } catch (error) {
        console.error('Error saving sessions to backend:', error);
    }
    
    // Always save to localStorage as backup
    if (chatStorage) {
        localStorageSuccess = chatStorage.saveSessions(sessions);
        if (localStorageSuccess) {
            console.log('Sessions saved to localStorage');
        }
    }
    
    if (!backendSuccess && !localStorageSuccess) {
        showNotification('Failed to save sessions', 'error');
        return false;
    }
    
    if (!backendSuccess && localStorageSuccess) {
        console.log('Sessions saved to localStorage only (backend unavailable)');
    }
    
    return true;
}

async function saveSession(sessionId, sessionData) {
    let backendSuccess = false;
    let localStorageSuccess = false;
    
    // Update the sessions object first
    sessions[sessionId] = sessionData;
    
    // Try to save to backend first
    try {
        const response = await fetch(`${BACKEND_URL}/api/sessions/${sessionId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(sessionData)
        });
        
        if (response.ok) {
            console.log('Session saved to backend:', sessionId);
            backendSuccess = true;
        } else {
            throw new Error('Failed to save session to backend');
        }
    } catch (error) {
        console.error('Error saving session to backend:', error);
    }
    
    // Always save to localStorage as backup
    if (chatStorage) {
        localStorageSuccess = chatStorage.saveSession(sessionId, sessionData);
        if (localStorageSuccess) {
            console.log('Session saved to localStorage:', sessionId);
        }
    }
    
    if (!backendSuccess && !localStorageSuccess) {
        showNotification('Failed to save session', 'error');
        return false;
    }
    
    if (!backendSuccess && localStorageSuccess) {
        console.log('Session saved to localStorage only (backend unavailable)');
    }
    
    return true;
}

async function deleteSession(sessionId) {
    try {
        const response = await fetch(`${BACKEND_URL}/api/sessions/${sessionId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error('Failed to delete session');
        }
        
        console.log('Session deleted from backend:', sessionId);
        return true;
    } catch (error) {
        console.error('Error deleting session:', error);
        showNotification('Failed to delete session from backend', 'error');
        return false;
    }
}

async function clearAllSessions() {
    try {
        const response = await fetch(`${BACKEND_URL}/api/sessions`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error('Failed to clear sessions');
        }
        
        console.log('All sessions cleared from backend');
        return true;
    } catch (error) {
        console.error('Error clearing sessions:', error);
        showNotification('Failed to clear sessions from backend', 'error');
        return false;
    }
}

function updateCurrentSessionInfo() {
    const infoElement = document.getElementById('currentSessionInfo');
    if (infoElement) {
        if (currentSessionId && sessions[currentSessionId]) {
            const session = sessions[currentSessionId];
            const systemPromptIndicator = systemPrompt && systemPrompt.trim() 
                ? ' <i class="fas fa-brain" title="System prompt active"></i>' 
                : '';
            infoElement.innerHTML = `<span class="session-status">Active: "${session.title}" (${session.messages.length} messages)${systemPromptIndicator}</span>`;
        } else {
            const systemPromptIndicator = systemPrompt && systemPrompt.trim() 
                ? ' <i class="fas fa-brain" title="System prompt active"></i>' 
                : '';
            infoElement.innerHTML = `<span class="session-status">No active session${systemPromptIndicator}</span>`;
        }
    }
}

async function autoSaveSession() {
    // Auto-save functionality
    if (!autoSaveEnabled) return;
    
    const messages = getCurrentMessages();
    if (messages.length === 0) return;
    
    // Create a new session if one doesn't exist
    if (!currentSessionId) {
        currentSessionId = generateSessionId();
        
        // Generate title from first user message
        let title = 'New Chat';
        const firstUserMsg = messages.find(m => m.role === 'You');
        if (firstUserMsg) {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = firstUserMsg.content;
            const plainText = tempDiv.textContent || tempDiv.innerText || '';
            title = plainText.length > 50 ? plainText.substring(0, 47) + '...' : plainText;
        }
        
        // Create new session
        sessions[currentSessionId] = {
            id: currentSessionId,
            title: title,
            messages: messages,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            systemPrompt: systemPrompt
        };
        
        console.log('Created new session:', currentSessionId);
    } else {
        // Update existing session
        if (sessions[currentSessionId]) {
            sessions[currentSessionId].messages = messages;
            sessions[currentSessionId].updatedAt = new Date().toISOString();
        }
    }
    
    // Save session to backend and localStorage
    if (currentSessionId && sessions[currentSessionId]) {
        await saveSession(currentSessionId, sessions[currentSessionId]);
        updateHistoryPanel();
        updateCurrentSessionInfo();
    }
}

function toggleHistory() {
    const historyPanel = document.getElementById('historyPanel');
    if (historyPanel) {
        historyPanel.classList.toggle('active');
        
        // Close settings panel if open
        const settingsPanel = document.getElementById('settingsPanel');
        if (historyPanel.classList.contains('active')) {
            settingsPanel.classList.remove('active');
        }
    }
}

async function saveCurrentSession() {
    const messages = getCurrentMessages();
    if (messages.length === 0) {
        showNotification('No messages to save!', 'error');
        return;
    }
    
    const sessionId = currentSessionId || generateSessionId();
    const now = new Date();
    
    // Generate title from first user message
    let title = 'New Chat';
    const firstUserMsg = messages.find(m => m.role === 'You');
    if (firstUserMsg) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = firstUserMsg.content;
        title = tempDiv.textContent.substring(0, 50).trim();
        if (title.length === 50) title += '...';
    }
    
    const sessionData = {
        id: sessionId,
        title: title,
        messages: messages,
        model: currentModel,
        serverUrl: serverUrl,
        systemPrompt: systemPrompt,
        createdAt: sessions[sessionId]?.createdAt || now.toISOString(),
        updatedAt: now.toISOString()
    };
    
    sessions[sessionId] = sessionData;
    currentSessionId = sessionId;
    
    // Save to backend
    const success = await saveSession(sessionId, sessionData);
    if (success) {
        updateCurrentSessionInfo();
        showNotification('Chat session saved!', 'success');
    }
}

function getCurrentMessages() {
    const messageElements = document.querySelectorAll('.message');
    const messages = [];
    
    messageElements.forEach(msgEl => {
        const role = msgEl.querySelector('.role')?.textContent;
        const content = msgEl.querySelector('.message-content')?.innerHTML;
        const files = Array.from(msgEl.querySelectorAll('.file')).map(f => f.textContent);
        const timestamp = msgEl.querySelector('.timestamp')?.textContent;
        
        messages.push({
            role: role,
            content: content,
            files: files,
            timestamp: timestamp
        });
    });
    
    return messages;
}

function generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function exportAllSessions() {
    if (Object.keys(sessions).length === 0) {
        showNotification('No sessions to export!', 'error');
        return;
    }
    
    const exportData = {
        exportDate: new Date().toISOString(),
        version: '1.0',
        sessions: sessions
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ollama-sessions-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification('Sessions exported to file!', 'success');
}

function importSessions() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async function(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = async function(e) {
            try {
                const importData = JSON.parse(e.target.result);
                
                if (importData.sessions) {
                    // Merge with existing sessions
                    Object.assign(sessions, importData.sessions);
                    
                    // Save to backend
                    const success = await saveSessions();
                    if (success) {
                        updateCurrentSessionInfo();
                        showNotification(`Imported ${Object.keys(importData.sessions).length} sessions!`, 'success');
                    }
                } else {
                    showNotification('Invalid session file format!', 'error');
                }
            } catch (error) {
                showNotification('Error reading session file!', 'error');
                console.error('Import error:', error);
            }
        };
        reader.readAsText(file);
    };
    input.click();
}

async function clearAllHistory() {
    if (Object.keys(sessions).length === 0) {
        showNotification('No history to clear!', 'error');
        return;
    }
    
    const confirmed = confirm('Delete all chat history? This cannot be undone.');
    if (!confirmed) return;
    
    // Clear from backend
    const success = await clearAllSessions();
    if (success) {
        sessions = {};
        currentSessionId = null;
        updateCurrentSessionInfo();
        showNotification('All history cleared', 'success');
    }
}

function saveChatToRTF() {
    const messages = document.querySelectorAll('.message');
    if (messages.length === 0) {
        showNotification('No messages to export!', 'error');
        return;
    }

    // Create RTF content with Unicode support for Traditional Chinese
    let rtf = '{\\rtf1\\ansi\\ansicpg950\\deff0\\deflang1028{\\fonttbl{\\f0\\fnil\\fcharset136 Microsoft JhengHei;}{\\f1\\fnil\\fcharset0 Calibri;}}';
    rtf += '{\\colortbl;\\red0\\green0\\blue0;\\red51\\green152\\blue219;\\red46\\green125\\blue50;\\red120\\green120\\blue120;}';
    rtf += '\\viewkind4\\uc1\\pard\\f0\\fs24\\cf1\n\n';

    // Add header
    rtf += '\\pard\\qc\\b\\fs28\\cf2 Ollama Web UI Chat Export\\b0\\fs24\\cf1\\par\n';
    rtf += `\\pard\\qc\\fs20\\cf4 Exported on ${new Date().toLocaleString()}\\fs24\\cf1\\par\n`;
    rtf += '\\pard\\par\n';

    messages.forEach((message, index) => {
        const isUser = message.classList.contains('user');
        const roleElement = message.querySelector('.role');
        const contentElement = message.querySelector('.message-content');
        const timestampElement = message.querySelector('.timestamp');
        const filesContainer = message.querySelector('.files');
        
        const role = roleElement?.textContent || (isUser ? 'You' : 'Assistant');
        const timestamp = timestampElement?.textContent || '';
        
        // Get content and handle HTML to plain text conversion
        let content = '';
        if (contentElement) {
            // Create a temporary element to convert HTML to plain text
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = contentElement.innerHTML;
            
            // Replace <br> with line breaks
            tempDiv.querySelectorAll('br').forEach(br => br.replaceWith('\n'));
            
            // Handle think tags - extract and format them with proper spacing and separator
            tempDiv.querySelectorAll('think').forEach(think => {
                const thinkText = think.textContent.trim();
                let thinkBlock = '\n' + '┌' + '─'.repeat(48) + '┐\n';
                thinkBlock += '│ <think>\n';
                thinkBlock += thinkText.split('\n').map(line => `│ ${line}`).join('\n') + '\n';
                thinkBlock += '│ </think>\n';
                thinkBlock += '└' + '─'.repeat(48) + '┘\n\n';
                think.replaceWith(thinkBlock);
            });
            
            // Replace <p> tags with paragraph breaks
            tempDiv.querySelectorAll('p').forEach(p => {
                p.insertAdjacentText('afterend', '\n\n');
            });
            
            // Handle code blocks properly with language detection
            tempDiv.querySelectorAll('pre').forEach(pre => {
                const codeElement = pre.querySelector('code');
                const codeText = (codeElement ? codeElement.textContent : pre.textContent) || '';
                const language = pre.getAttribute('data-language') || '';
                
                // Format code block for RTF export with cleaner formatting
                let codeBlock = '\n';
                codeBlock += '=' + '='.repeat(60) + '\n';
                if (language) {
                    codeBlock += `--- ${language.toUpperCase()} CODE ---\\line\n`;
                } else {
                    codeBlock += '--- CODE ---\\line\n';
                }
                codeBlock += '\n';  // Add line feed after CODE ---
                
                // Add code content with proper line break handling and indentation preservation
                if (codeText.trim()) {
                    // Preserve line breaks and indentation in code
                    // Split into lines and preserve leading whitespace
                    const codeLines = codeText.split('\n');
                    const processedLines = codeLines.map(line => {
                        // Convert leading spaces to non-breaking spaces for RTF
                        const leadingSpaces = line.match(/^[ \t]*/)[0];
                        const restOfLine = line.substring(leadingSpaces.length);
                        // Convert tabs to 4 spaces and spaces to non-breaking spaces
                        const indentSpaces = leadingSpaces.replace(/\t/g, '    ').replace(/ /g, ' ');
                        return indentSpaces + restOfLine;
                    });
                    // Join with RTF line breaks instead of plain newlines
                    codeBlock += processedLines.join('\\line\n') + '\\line\n';
                } else {
                    codeBlock += '(empty code block)\n';
                }
                
                codeBlock += '=' + '='.repeat(60) + '\n\n';
                
                pre.replaceWith(codeBlock);
            });
            
            // Handle inline code (not inside pre tags)
            tempDiv.querySelectorAll('code').forEach(code => {
                // Skip if this code element is inside a pre tag (already handled above)
                if (!code.closest('pre')) {
                    const codeText = code.textContent || '';
                    code.replaceWith(`\`${codeText}\``);
                }
            });
            
            // Replace list items
            tempDiv.querySelectorAll('li').forEach(li => {
                li.insertAdjacentText('beforebegin', '• ');
                li.insertAdjacentText('afterend', '\n');
            });
            
            content = tempDiv.textContent || tempDiv.innerText || '';
        }
        
        // Clean up content and escape RTF special characters
        content = content.trim();
        
        // First, protect code blocks from ALL processing
        let codeBlocks = [];
        let codeIndex = 0;
        
        // Extract and protect code blocks (between === lines) BEFORE any other processing
        content = content.replace(/(={60}\n[\s\S]*?\n={60})/g, (match) => {
            codeBlocks.push(match);
            return `__CODE_${codeIndex++}__`;
        });
        
        // Only escape RTF control characters, not backslashes for math expressions
        content = content.replace(/\{/g, '\\{')
                        .replace(/\}/g, '\\}');

        // Process line breaks more carefully - convert multiple newlines to proper RTF paragraph breaks
        // This now only affects non-code content since code blocks are protected
        content = content.replace(/\n{3,}/g, '\n\n')  // Reduce excessive newlines to max 2
                        .replace(/\n\n/g, '\\par\\par ')  // Double newlines for paragraph separation
                        .replace(/\n/g, ' ');  // Single newlines become spaces (safe now that code is protected)

        // Improved math expression protection - protect more patterns
        const mathPatterns = [
            /\$[^$]+\$/g,                          // $expression$
            /\$\$[^$]+\$\$/g,                      // $$expression$$
            /\\\([^)]+\\\)/g,                      // \(expression\)
            /\\\[[^\]]+\\\]/g,                     // \[expression\]
            /\[[^\]]*\\[a-zA-Z]+[^\]]*\]/g,        // [expression with \text{} etc]
            /\\[a-zA-Z]+\{[^}]*\}/g,               // \command{content}
            /\\[a-zA-Z]+/g,                        // \command
            /\\\\/g,                               // \\ (line breaks in math)
            /\\&/g,                                // \& (ampersand in math)
            /\\%/g,                                // \% (percent in math)
            /\\_/g,                                // \_ (underscore in math)
            /\\\^/g,                               // \^ (caret in math)
            /\\\$/g                                // \$ (dollar in math)
        ];

        let protectedContent = content;
        let mathExpressions = [];
        let mathIndex = 0;

        // Extract and protect math expressions
        mathPatterns.forEach(pattern => {
            protectedContent = protectedContent.replace(pattern, (match) => {
                const placeholder = `__MATH_${mathIndex}__`;
                mathExpressions[mathIndex] = match;
                mathIndex++;
                return placeholder;
            });
        });

        // Only escape remaining backslashes that are not part of protected math or code
        // Be more conservative - only escape standalone backslashes
        protectedContent = protectedContent.replace(/\\(?![a-zA-Z_\^\$%&])/g, '\\\\');

        // Restore code blocks first (before math, since code blocks might contain math-like syntax)
        codeBlocks.forEach((block, index) => {
            protectedContent = protectedContent.replace(`__CODE_${index}__`, block);
        });

        // Restore math expressions
        mathExpressions.forEach((expr, index) => {
            protectedContent = protectedContent.replace(`__MATH_${index}__`, expr);
        });
        
        content = protectedContent;
        
        // Convert Unicode characters (Traditional Chinese) to RTF Unicode format
        content = content.replace(/[\u0080-\uFFFF]/g, function(match) {
            return '\\u' + match.charCodeAt(0) + '?';
        });
        
        // Add role header with different colors for user vs assistant
        if (isUser) {
            rtf += `\\pard\\sl240\\slmult1\\b\\f1\\fs22\\cf2 👤 ${role}`;
        } else {
            rtf += `\\pard\\sl240\\slmult1\\b\\f1\\fs22\\cf3 🤖 ${role}`;
        }
        
        if (timestamp) {
            rtf += `\\b0\\fs18\\cf4  (${timestamp})`;
        }
        rtf += '\\b0\\fs20\\cf1\\par\n';
        
        // Add file attachments if any
        if (filesContainer) {
            const files = filesContainer.querySelectorAll('.file');
            if (files.length > 0) {
                rtf += '\\pard\\sl240\\slmult1\\f1\\fs18\\cf4 📎 Attachments: ';
                const fileNames = Array.from(files).map(file => file.textContent).join(', ');
                rtf += fileNames.replace(/[\u0080-\uFFFF]/g, function(match) {
                    return '\\u' + match.charCodeAt(0) + '?';
                });
                rtf += '\\fs20\\cf1\\par\n';
            }
        }
        
        // Add message content
        if (content) {
            rtf += `\\pard\\sl240\\slmult1\\f0\\fs20\\cf1 ${content}\\par\n`;
        } else if (!isUser) {
            rtf += '\\pard\\sl240\\slmult1\\f0\\fs20\\cf4 [No response content]\\par\n';
        }
        
        // Add spacing between messages
        if (index < messages.length - 1) {
            rtf += '\\par\n';
        }
    });

    // Add footer
    rtf += '\\par\n\\pard\\qc\\fs16\\cf4 Generated by Ollama Web UI\\par\n';
    rtf += '}';

    // Create and download the file
    const blob = new Blob([rtf], { type: 'application/rtf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ollama-chat-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.rtf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showNotification('Chat exported as RTF file with Traditional Chinese support!', 'success');
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-triangle' : 'fa-info-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Add basic notification styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#d4edda' : type === 'error' ? '#f8d7da' : '#d1ecf1'};
        color: ${type === 'success' ? '#155724' : type === 'error' ? '#721c24' : '#0c5460'};
        border: 1px solid ${type === 'success' ? '#c3e6cb' : type === 'error' ? '#f5c6cb' : '#bee5eb'};
        border-radius: 8px;
        padding: 12px 16px;
        z-index: 1000;
        display: flex;
        align-items: center;
        gap: 8px;
        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        max-width: 400px;
        word-wrap: break-word;
        font-size: 14px;
    `;
    
    document.body.appendChild(notification);
    
    // Auto-dismiss after longer time for error messages
    const dismissTime = type === 'error' ? 5000 : 3000;
    setTimeout(() => {
        notification.remove();
    }, dismissTime);
}

// History panel functions
function updateHistoryPanel() {
    console.log('=== UPDATING HISTORY PANEL ===');
    const historyList = document.getElementById('sessionsList');
    console.log('History list element found:', !!historyList);
    
    if (!historyList) {
        console.error('sessionsList element not found!');
        return;
    }
    
    console.log('Sessions available:', Object.keys(sessions).length);
    console.log('Sessions data:', sessions);
    
    historyList.innerHTML = '';
    
    const sessionEntries = Object.values(sessions).sort((a, b) => 
        new Date(b.updatedAt) - new Date(a.updatedAt)
    );
    
    console.log('Session entries to display:', sessionEntries.length);
    
    if (sessionEntries.length === 0) {
        console.log('No sessions to display, showing empty message');
        historyList.innerHTML = `
            <div class="empty-history">
                <i class="fas fa-folder-open"></i>
                <p>No saved chats yet</p>
                <small>Start a conversation and save it to see your chat history</small>
            </div>
        `;
        return;
    }
    
    console.log('Creating history items...');
    sessionEntries.forEach((session, index) => {
        console.log(`Creating item ${index + 1}:`, session.title, 'Messages:', session.messages?.length || 0);
        
        const item = document.createElement('div');
        item.className = `history-item ${session.id === currentSessionId ? 'active' : ''}`;
        
        // Add system prompt indicator
        const systemPromptIndicator = session.systemPrompt && session.systemPrompt.trim() 
            ? '<i class="fas fa-brain" title="Custom system prompt"></i>' 
            : '';
        
        // Ensure session has messages array
        const messageCount = session.messages ? session.messages.length : 0;
        
        item.innerHTML = `
            <div class="history-item-content" onclick="loadSession('${session.id}')">
                <div class="history-item-title">${session.title} ${systemPromptIndicator}</div>
                <div class="history-item-meta">
                    ${messageCount} messages • ${new Date(session.updatedAt).toLocaleDateString()}
                </div>
            </div>
            <div class="history-item-actions">
                <button onclick="renameSession('${session.id}')" title="Rename">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="deleteSessionFromHistory('${session.id}')" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        historyList.appendChild(item);
    });
    
    console.log('History panel updated with', sessionEntries.length, 'items');
    console.log('=== HISTORY PANEL UPDATE COMPLETE ===');
}

async function loadSession(sessionId) {
    if (!sessions[sessionId]) {
        showNotification('Session not found!', 'error');
        return;
    }
    
    // Use the new loadSessionIntoChat function
    loadSessionIntoChat(sessionId);
    
    const session = sessions[sessionId];
    
    // Restore session settings
    if (session.model && session.model !== currentModel) {
        currentModel = session.model;
        const modelSelect = document.getElementById('modelSelect');
        if (modelSelect) {
            modelSelect.value = currentModel;
        }
    }
    
    if (session.serverUrl && session.serverUrl !== serverUrl) {
        serverUrl = session.serverUrl;
        const serverInput = document.getElementById('serverIp');
        if (serverInput) {
            serverInput.value = serverUrl;
        }
    }
    
    if (session.systemPrompt !== undefined) {
        systemPrompt = session.systemPrompt;
        const systemPromptInput = document.getElementById('systemPrompt');
        if (systemPromptInput) {
            systemPromptInput.value = systemPrompt;
        }
    }
    
    // Close history panel on mobile
    const historyPanel = document.getElementById('historyPanel');
    if (historyPanel && window.innerWidth <= 768) {
        historyPanel.classList.remove('active');
    }
    
    showNotification(`Loaded session: ${session.title}`, 'success');
}

async function deleteSessionFromHistory(sessionId) {
    if (!sessions[sessionId]) {
        showNotification('Session not found!', 'error');
        return;
    }
    
    const session = sessions[sessionId];
    const confirmed = confirm(`Delete session "${session.title}"? This cannot be undone.`);
    if (!confirmed) return;
    
    // Delete from backend
    const success = await deleteSession(sessionId);
    if (success) {
        delete sessions[sessionId];
        
        if (currentSessionId === sessionId) {
            currentSessionId = null;
            // Clear current chat
            const messagesContainer = document.getElementById('messages');
            messagesContainer.innerHTML = '';
        }
        
        updateCurrentSessionInfo();
        updateHistoryPanel();
        showNotification('Session deleted', 'success');
    }
}

function renameSession(sessionId) {
    if (!sessions[sessionId]) {
        showNotification('Session not found!', 'error');
        return;
    }
    
    const session = sessions[sessionId];
    const newTitle = prompt('Enter new title:', session.title);
    if (!newTitle || newTitle.trim() === '') return;
    
    session.title = newTitle.trim();
    session.updatedAt = new Date().toISOString();
    
    // Save to backend
    saveSession(sessionId, session).then(success => {
        if (success) {
            updateCurrentSessionInfo();
            updateHistoryPanel();
            showNotification('Session renamed', 'success');
        }
    });
}

function newChat() {
    // Save current session if it has messages
    const messages = document.querySelectorAll('.message');
    if (messages.length > 0 && currentSessionId) {
        setTimeout(() => autoSaveSession(), 100);
    }
    
    // Clear current chat
    const messagesContainer = document.getElementById('messages');
    messagesContainer.innerHTML = '';
    
    // Reset session
    currentSessionId = null;
    uploadedFiles = [];
    
    // Clear file list
    const fileList = document.getElementById('fileList');
    if (fileList) {
        fileList.innerHTML = '';
    }
    
    updateCurrentSessionInfo();
    updateHistoryPanel();
    showNotification('Started new chat', 'success');
}

// Call updateHistoryPanel when sessions are loaded
async function initializeHistoryPanel() {
    updateHistoryPanel();
}

// Chat History Management Functions
function loadChatHistoryOnStartup() {
    // This function ensures chat sessions are loaded into the History panel only
    // The chat area remains clean until user selects a session from History panel
    
    console.log('=== LOADING CHAT HISTORY ON STARTUP ===');
    
    if (!chatStorage) {
        console.log('No chatStorage available');
        return;
    }
    
    console.log('Loading chat history on startup...');
    console.log('Current sessions in memory:', Object.keys(sessions).length);
    
    // Check what's in localStorage directly
    const localStorageData = localStorage.getItem('ollama-chat-sessions');
    console.log('Raw localStorage data exists:', !!localStorageData);
    if (localStorageData) {
        try {
            const parsed = JSON.parse(localStorageData);
            console.log('Parsed localStorage data:', parsed);
        } catch (e) {
            console.error('Error parsing localStorage data:', e);
        }
    }
    
    // If no sessions are loaded yet and localStorage has sessions, load them
    if (Object.keys(sessions).length === 0) {
        const localSessions = chatStorage.loadSessions();
        console.log('LocalStorage sessions found:', Object.keys(localSessions).length);
        console.log('Local sessions data:', localSessions);
        
        if (localSessions && Object.keys(localSessions).length > 0) {
            sessions = localSessions;
            console.log(`Loaded ${Object.keys(sessions).length} sessions from localStorage into History panel`);
            updateHistoryPanel();
            
            // Show notification about available sessions but don't auto-load
            showNotification(`${Object.keys(sessions).length} saved sessions available in History panel`, 'success');
        } else {
            console.log('No sessions found in localStorage');
        }
    } else {
        console.log('Sessions already loaded in memory, updating History panel');
        updateHistoryPanel();
        
        // Show notification about available sessions but don't auto-load
        if (Object.keys(sessions).length > 0) {
            showNotification(`${Object.keys(sessions).length} saved sessions available in History panel`, 'info');
        }
    }
    
    // Always keep chat area clean - reset currentSessionId
    currentSessionId = null;
    updateCurrentSessionInfo();
    
    console.log('=== CHAT HISTORY STARTUP COMPLETE ===');
}

function loadSessionIntoChat(sessionId) {
    if (!sessions[sessionId]) {
        console.error('Session not found:', sessionId);
        return;
    }
    
    const session = sessions[sessionId];
    currentSessionId = sessionId;
    
    // Clear current chat
    const chatContainer = document.getElementById('chatContainer');
    const welcomeMessage = chatContainer.querySelector('.welcome-message');
    if (welcomeMessage) {
        welcomeMessage.remove();
    }
    
    // Clear existing messages
    const existingMessages = chatContainer.querySelectorAll('.message');
    existingMessages.forEach(msg => msg.remove());
    
    // Load session messages
    if (session.messages && session.messages.length > 0) {
        session.messages.forEach(message => {
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${message.role.toLowerCase()}`;
            messageDiv.innerHTML = `
                <div class="role">${message.role}</div>
                <div class="message-content">${message.content}</div>
                ${message.timestamp ? `<div class="timestamp">${message.timestamp}</div>` : ''}
            `;
            chatContainer.appendChild(messageDiv);
        });
        
        // Scroll to bottom
        chatContainer.scrollTop = chatContainer.scrollHeight;
        
        // Re-render math if available
        setTimeout(() => {
            const mathElements = chatContainer.querySelectorAll('.message-content');
            mathElements.forEach(element => renderMathInContent(element));
        }, 100);
        
        console.log(`Loaded ${session.messages.length} messages into chat area`);
    }
    
    // Update UI
    updateCurrentSessionInfo();
    updateHistoryPanel();
}

function saveChatHistoryAuto() {
    if (!autoSaveEnabled || !currentSessionId) return;
    
    const messages = getCurrentMessagesForStorage();
    if (messages.length > 0) {
        // Update current session with messages
        if (sessions[currentSessionId]) {
            sessions[currentSessionId].messages = messages;
            sessions[currentSessionId].updatedAt = new Date().toISOString();
            
            // Auto-save session to localStorage and backend
            if (chatStorage) {
                chatStorage.autoSaveSessions(sessions);
            }
            
            // Update history panel to reflect changes
            updateHistoryPanel();
        }
    }
}

function getCurrentMessagesForStorage() {
    const messageElements = document.querySelectorAll('.message');
    const messages = [];
    
    messageElements.forEach(msgEl => {
        const role = msgEl.querySelector('.role')?.textContent;
        const content = msgEl.querySelector('.message-content')?.innerHTML;
        const files = Array.from(msgEl.querySelectorAll('.file')).map(f => f.textContent);
        const timestamp = msgEl.querySelector('.timestamp')?.textContent;
        
        messages.push({
            role: role,
            content: content,
            files: files,
            timestamp: timestamp
        });
    });
    
    return messages;
}

function exportChatHistory() {
    if (!chatStorage) {
        showNotification('Chat storage not available', 'error');
        return;
    }
    
    if (Object.keys(sessions).length === 0) {
        showNotification('No sessions to export!', 'error');
        return;
    }
    
    if (chatStorage.exportToFile(sessions)) {
        showNotification('Chat sessions exported successfully!', 'success');
    } else {
        showNotification('Error exporting chat sessions', 'error');
    }
}

async function importChatHistory() {
    if (!chatStorage) {
        showNotification('Chat storage not available', 'error');
        return;
    }
    
    try {
        const importedSessions = await chatStorage.importFromFile();
        if (importedSessions && Object.keys(importedSessions).length > 0) {
            // Confirm before importing
            const sessionCount = Object.keys(importedSessions).length;
            const confirmed = confirm(`Import ${sessionCount} sessions? This will add to your existing sessions.`);
            if (!confirmed) return;
            
            // Merge imported sessions with existing sessions
            Object.assign(sessions, importedSessions);
            
            // Save merged sessions
            await saveSessions();
            
            // Update history panel
            updateHistoryPanel();
            
            showNotification(`Imported ${sessionCount} sessions successfully!`, 'success');
        }
    } catch (error) {
        console.error('Error importing chat sessions:', error);
        showNotification('Error importing chat sessions', 'error');
    }
}

function clearChatHistory() {
    if (!chatStorage) {
        showNotification('Chat storage not available', 'error');
        return;
    }
    
    const sessionCount = Object.keys(sessions).length;
    if (sessionCount === 0) {
        showNotification('No sessions to clear', 'info');
        return;
    }
    
    const confirmed = confirm(`Clear all ${sessionCount} saved sessions? This cannot be undone.`);
    if (!confirmed) return;
    
    // Clear sessions from memory
    sessions = {};
    currentSessionId = null;
    
    // Clear from localStorage
    if (chatStorage.clearHistory()) {
        // Update UI
        updateHistoryPanel();
        startNewChat();
        showNotification('All chat sessions cleared', 'success');
    } else {
        showNotification('Error clearing chat sessions', 'error');
    }
}

function getChatStorageInfo() {
    if (!chatStorage) return null;
    
    try {
        const savedData = localStorage.getItem(chatStorage.storageKey);
        if (!savedData) return null;

        const sessionData = JSON.parse(savedData);
        const sessions = sessionData.sessions || {};
        
        let totalMessages = 0;
        Object.values(sessions).forEach(session => {
            if (session.messages) {
                totalMessages += session.messages.length;
            }
        });
        
        return {
            sessionCount: Object.keys(sessions).length,
            messageCount: totalMessages,
            lastSaved: sessionData.timestamp,
            version: sessionData.version,
            sizeKB: Math.round(savedData.length / 1024 * 100) / 100
        };
    } catch (error) {
        console.error('Error getting storage info:', error);
        return null;
    }
}

// Content preprocessing function to handle think tags and auto-format code blocks
function preprocessContent(content) {
    if (!content) {
        console.log('preprocessContent: content is empty');
        return content;
    }
    
    console.log('preprocessContent: original content type:', typeof content, 'length:', content.length);
    console.log('preprocessContent: content preview:', content.substring(0, 200) + '...');
    
    // Replace </think> with </think> followed by a line break
    let processedContent = content.replace(/<\/think>/gi, '</think>\n\n');
    
    // Re-enable auto-detection with better logging
    const beforeAuto = processedContent.length;
    processedContent = autoFormatCodeBlocks(processedContent);
    const afterAuto = processedContent.length;
    
    console.log('preprocessContent: auto-detection changed length from', beforeAuto, 'to', afterAuto);
    console.log('preprocessContent: final processed length:', processedContent.length);
    console.log('preprocessContent: final preview:', processedContent.substring(0, 300) + '...');
    
    return processedContent;
}

// Auto-detect and format code blocks from model responses
function autoFormatCodeBlocks(content) {
    if (!content || typeof content !== 'string') {
        console.log('autoFormatCodeBlocks: content is not a string:', typeof content, content);
        return content;
    }
    
    // Skip if already has code blocks
    if (content.includes('```')) {
        console.log('autoFormatCodeBlocks: content already has code blocks, skipping');
        return content;
    }
    
    console.log('autoFormatCodeBlocks: processing content:', content.substring(0, 100) + '...');
    
    let processedContent = content;
    
    // Very simple detection - look for obvious code patterns in lines
    const lines = content.split('\n');
    let result = [];
    let codeBuffer = [];
    let currentLanguage = '';
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();
        
        // Detect if this line looks like code
        let isCode = false;
        let language = '';
        
        // Python detection
        if (trimmed.includes('print(') || trimmed.startsWith('def ') || trimmed.startsWith('import ') || 
            trimmed.startsWith('from ') || trimmed.startsWith('class ') || trimmed.includes('"""') ||
            trimmed.includes("'''") || /^\s*(if|for|while|try|except|with)\s+.*:/.test(trimmed)) {
            isCode = true;
            language = 'python';
        }
        // JavaScript detection
        else if (trimmed.includes('console.log(') || trimmed.startsWith('function ') || 
                 trimmed.startsWith('const ') || trimmed.startsWith('let ') || trimmed.startsWith('var ') ||
                 /^\s*(if|for|while|try|catch)\s*\(/.test(trimmed) || trimmed.includes('=>')) {
            isCode = true;
            language = 'javascript';
        }
        
        if (isCode) {
            if (codeBuffer.length === 0) {
                currentLanguage = language;
                console.log(`autoFormatCodeBlocks: detected ${language} code at line ${i}:`, trimmed);
            }
            codeBuffer.push(line);
        } else {
            // Not code - flush any pending code buffer
            if (codeBuffer.length > 0) {
                console.log(`autoFormatCodeBlocks: flushing ${codeBuffer.length} lines of ${currentLanguage} code`);
                result.push(`\`\`\`${currentLanguage}`);
                result.push(...codeBuffer);
                result.push('```');
                codeBuffer = [];
                currentLanguage = '';
            }
            result.push(line);
        }
    }
    
    // Flush any remaining code
    if (codeBuffer.length > 0) {
        console.log(`autoFormatCodeBlocks: flushing final ${codeBuffer.length} lines of ${currentLanguage} code`);
        result.push(`\`\`\`${currentLanguage}`);
        result.push(...codeBuffer);
        result.push('```');
    }
    
    const finalResult = result.join('\n');
    console.log('autoFormatCodeBlocks: final result length:', finalResult.length, 'vs original:', content.length);
    return finalResult;
}

// Detect programming language from code content
function detectLanguageFromContent(content) {
    const lowerContent = content.toLowerCase();
    
    // JavaScript/TypeScript detection
    if (lowerContent.includes('const ') || lowerContent.includes('let ') || 
        lowerContent.includes('function') || lowerContent.includes('console.log') ||
        lowerContent.includes('import ') || lowerContent.includes('export ') ||
        lowerContent.includes('async ') || lowerContent.includes('await ')) {
        return 'javascript';
    }
    
    // Python detection
    if (lowerContent.includes('def ') || lowerContent.includes('print(') ||
        lowerContent.includes('import ') || lowerContent.includes('from ') ||
        lowerContent.includes('class ') || content.includes('    ') ||
        lowerContent.includes('if __name__')) {
        return 'python';
    }
    
    // HTML detection
    if (content.includes('<') && content.includes('>') && 
        (lowerContent.includes('<html') || lowerContent.includes('<div') ||
         lowerContent.includes('<span') || lowerContent.includes('<p'))) {
        return 'html';
    }
    
    // CSS detection
    if (content.includes('{') && content.includes('}') && 
        (content.includes(':') && content.includes(';'))) {
        return 'css';
    }
    
    // SQL detection
    if (lowerContent.includes('select ') || lowerContent.includes('insert ') ||
        lowerContent.includes('update ') || lowerContent.includes('delete ') ||
        lowerContent.includes('create ') || lowerContent.includes('from ')) {
        return 'sql';
    }
    
    // Shell/Bash detection
    if (content.includes('$') || lowerContent.includes('sudo ') ||
        lowerContent.includes('npm ') || lowerContent.includes('git ') ||
        lowerContent.includes('docker ') || lowerContent.includes('curl ')) {
        return 'bash';
    }
    
    // JSON detection
    if ((content.trim().startsWith('{') && content.trim().endsWith('}')) ||
        (content.trim().startsWith('[') && content.trim().endsWith(']'))) {
        try {
            JSON.parse(content.trim());
            return 'json';
        } catch (e) {
            // Not valid JSON
        }
    }
    
    // YAML detection
    if (content.includes(':') && content.includes('\n') && 
        !content.includes('{') && !content.includes('(')) {
        return 'yaml';
    }
    
    // Default fallback
    return '';
}

// Handle code block copy functionality
function handleCodeBlockCopy(event) {
    const target = event.target;
    
    // Check if clicked on a code block's copy area
    if (target.tagName === 'PRE' || target.closest('pre')) {
        const preElement = target.tagName === 'PRE' ? target : target.closest('pre');
        const rect = preElement.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const clickY = event.clientY - rect.top;
        
        // Check if click was in the copy button area (top-right corner)
        if (clickX > rect.width - 60 && clickY < 40) {
            event.preventDefault();
            event.stopPropagation();
            
            const codeElement = preElement.querySelector('code');
            const codeText = codeElement ? codeElement.textContent : preElement.textContent;
            
            // Copy to clipboard
            navigator.clipboard.writeText(codeText).then(() => {
                showNotification('Code copied to clipboard!', 'success');
                
                // Visual feedback
                const originalAfter = getComputedStyle(preElement, '::after').content;
                preElement.style.setProperty('--copy-icon', '"✓"');
                setTimeout(() => {
                    preElement.style.removeProperty('--copy-icon');
                }, 1000);
            }).catch(err => {
                console.error('Failed to copy code:', err);
                showNotification('Failed to copy code', 'error');
            });
        }
    }
}

function updateStorageInfo() {
    const storageInfoElement = document.getElementById('storageInfo');
    if (!storageInfoElement || !chatStorage) return;
    
    const info = getChatStorageInfo();
    
    if (info) {
        const lastSavedDate = new Date(info.lastSaved).toLocaleString();
        storageInfoElement.innerHTML = `
            <div class="storage-stats">
                <div><strong>${info.sessionCount}</strong> sessions</div>
                <div><strong>${info.messageCount}</strong> messages saved</div>
                <div><strong>${info.sizeKB} KB</strong> storage used</div>
                <div>Last saved: <strong>${lastSavedDate}</strong></div>
                <div>Version: <strong>${info.version}</strong></div>
            </div>
        `;
    } else {
        storageInfoElement.innerHTML = `
            <div class="storage-stats">
                <span>No chat sessions saved</span>
            </div>
        `;
    }
}
