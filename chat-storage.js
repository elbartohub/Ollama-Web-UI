// Chat Storage Module - Local File System Storage
class ChatStorage {
    constructor() {
        this.storageKey = 'ollama-chat-sessions';
        this.autoSaveEnabled = true;
        this.saveTimeout = null;
    }

    // Save chat sessions to localStorage
    saveSessions(sessions) {
        try {
            const sessionData = {
                sessions: sessions,
                timestamp: new Date().toISOString(),
                version: '1.0'
            };
            
            localStorage.setItem(this.storageKey, JSON.stringify(sessionData));
            console.log('Chat sessions saved to localStorage');
            return true;
        } catch (error) {
            console.error('Error saving chat sessions:', error);
            return false;
        }
    }

    // Load chat sessions from localStorage
    loadSessions() {
        try {
            const savedData = localStorage.getItem(this.storageKey);
            if (!savedData) {
                console.log('No saved chat sessions found');
                return {};
            }

            const sessionData = JSON.parse(savedData);
            console.log('Chat sessions loaded from localStorage');
            return sessionData.sessions || {};
        } catch (error) {
            console.error('Error loading chat sessions:', error);
            return {};
        }
    }

    // Save a single session
    saveSession(sessionId, sessionData) {
        const sessions = this.loadSessions();
        sessions[sessionId] = sessionData;
        return this.saveSessions(sessions);
    }

    // Delete a session
    deleteSession(sessionId) {
        const sessions = this.loadSessions();
        delete sessions[sessionId];
        return this.saveSessions(sessions);
    }

    // Auto-save sessions with debouncing
    autoSaveSessions(sessions) {
        if (!this.autoSaveEnabled) return;

        // Clear existing timeout
        if (this.saveTimeout) {
            clearTimeout(this.saveTimeout);
        }

        // Set new timeout for auto-save
        this.saveTimeout = setTimeout(() => {
            this.saveSessions(sessions);
        }, 1000); // Save after 1 second of inactivity
    }

    // Export sessions to file
    exportToFile(sessions) {
        try {
            const exportData = {
                sessions: sessions,
                exportDate: new Date().toISOString(),
                version: '1.0'
            };

            const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
                type: 'application/json' 
            });
            
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `ollama-sessions-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            console.log('Chat history exported to file');
            return true;
        } catch (error) {
            console.error('Error exporting chat history:', error);
            return false;
        }
    }

    // Import chat sessions from file
    importFromFile() {
        return new Promise((resolve, reject) => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            
            input.onchange = (event) => {
                const file = event.target.files[0];
                if (!file) {
                    resolve(null);
                    return;
                }

                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const importData = JSON.parse(e.target.result);
                        console.log('Chat sessions imported from file');
                        
                        // Handle both session format and legacy message format
                        if (importData.sessions) {
                            resolve(importData.sessions);
                        } else if (importData.messages) {
                            // Convert old format to session format
                            const sessionId = `imported-${Date.now()}`;
                            const session = {
                                id: sessionId,
                                title: `Imported Chat ${new Date().toLocaleDateString()}`,
                                messages: importData.messages,
                                createdAt: new Date().toISOString(),
                                updatedAt: new Date().toISOString(),
                                systemPrompt: ''
                            };
                            resolve({ [sessionId]: session });
                        } else {
                            resolve({});
                        }
                    } catch (error) {
                        console.error('Error parsing imported file:', error);
                        reject(error);
                    }
                };
                reader.onerror = () => reject(new Error('File read error'));
                reader.readAsText(file);
            };

            input.click();
        });
    }

    // Clear all saved chat history
    clearHistory() {
        try {
            localStorage.removeItem(this.storageKey);
            console.log('Chat history cleared');
            return true;
        } catch (error) {
            console.error('Error clearing chat history:', error);
            return false;
        }
    }

    // Get storage info
    getStorageInfo() {
        try {
            const savedData = localStorage.getItem(this.storageKey);
            if (!savedData) return null;

            const chatData = JSON.parse(savedData);
            return {
                messageCount: chatData.messages ? chatData.messages.length : 0,
                lastSaved: chatData.timestamp,
                version: chatData.version,
                sizeKB: Math.round(savedData.length / 1024 * 100) / 100
            };
        } catch (error) {
            console.error('Error getting storage info:', error);
            return null;
        }
    }
}

// Export for use in main script
window.ChatStorage = ChatStorage;
