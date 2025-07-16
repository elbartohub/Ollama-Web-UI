const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3001;
const SESSIONS_DIR = path.join(__dirname, 'sessions');
const SESSIONS_FILE = path.join(SESSIONS_DIR, 'sessions.json');
const CONFIG_FILE = path.join(SESSIONS_DIR, 'config.json');

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static('.'));

// Ensure sessions directory and files exist and are valid
async function ensureSessionsDir() {
    try {
        // Ensure sessions directory exists
        try {
            await fs.access(SESSIONS_DIR);
            console.log('✅ Sessions directory found');
        } catch {
            await fs.mkdir(SESSIONS_DIR, { recursive: true });
            console.log('📁 Created sessions directory');
        }
        
        // Ensure sessions.json exists and is valid
        let sessionsFileValid = false;
        try {
            await fs.access(SESSIONS_FILE);
            const data = await fs.readFile(SESSIONS_FILE, 'utf8');
            JSON.parse(data); // Test if it's valid JSON
            sessionsFileValid = true;
            console.log('✅ Sessions file is valid');
        } catch (error) {
            if (error.code === 'ENOENT') {
                console.log('📄 Sessions file not found, creating...');
            } else {
                console.log('⚠️  Sessions file corrupted, recreating...', error.message);
            }
        }
        
        if (!sessionsFileValid) {
            await fs.writeFile(SESSIONS_FILE, JSON.stringify({}, null, 2));
            console.log('✅ Created/fixed sessions.json');
        }
        
        // Ensure config.json exists and is valid
        let configFileValid = false;
        try {
            await fs.access(CONFIG_FILE);
            const data = await fs.readFile(CONFIG_FILE, 'utf8');
            const config = JSON.parse(data); // Test if it's valid JSON
            
            // Validate config structure
            if (config && typeof config === 'object' && 
                typeof config.serverUrl === 'string' &&
                typeof config.model === 'string' &&
                typeof config.systemPrompt === 'string') {
                configFileValid = true;
                console.log('✅ Config file is valid');
            } else {
                console.log('⚠️  Config file has invalid structure, recreating...');
            }
        } catch (error) {
            if (error.code === 'ENOENT') {
                console.log('📄 Config file not found, creating...');
            } else {
                console.log('⚠️  Config file corrupted, recreating...', error.message);
            }
        }
        
        if (!configFileValid) {
            const defaultConfig = {
                serverUrl: 'http://localhost:11434',
                model: '',
                systemPrompt: '',
                lastUpdated: new Date().toISOString(),
                createdAt: new Date().toISOString()
            };
            await fs.writeFile(CONFIG_FILE, JSON.stringify(defaultConfig, null, 2));
            console.log('✅ Created/fixed config.json with default settings');
        }
        
    } catch (error) {
        console.error('❌ Error ensuring sessions directory:', error);
        throw error;
    }
}

// Load all sessions
app.get('/api/sessions', async (req, res) => {
    try {
        let data;
        try {
            data = await fs.readFile(SESSIONS_FILE, 'utf8');
        } catch (error) {
            if (error.code === 'ENOENT') {
                console.log('⚠️  Sessions file missing during runtime, recreating...');
                await ensureSessionsDir();
                data = await fs.readFile(SESSIONS_FILE, 'utf8');
            } else {
                throw error;
            }
        }
        
        let sessions;
        try {
            sessions = JSON.parse(data);
        } catch (parseError) {
            console.log('⚠️  Sessions file corrupted during runtime, recreating...');
            await fs.writeFile(SESSIONS_FILE, JSON.stringify({}, null, 2));
            sessions = {};
        }
        
        res.json(sessions);
    } catch (error) {
        console.error('Error loading sessions:', error);
        res.status(500).json({ error: 'Failed to load sessions' });
    }
});

// Save all sessions
app.post('/api/sessions', async (req, res) => {
    try {
        const sessions = req.body;
        await fs.writeFile(SESSIONS_FILE, JSON.stringify(sessions, null, 2));
        
        // Also save a timestamped backup
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        const backupFile = path.join(SESSIONS_DIR, `backup-${timestamp}.json`);
        await fs.writeFile(backupFile, JSON.stringify(sessions, null, 2));
        
        res.json({ success: true });
    } catch (error) {
        console.error('Error saving sessions:', error);
        res.status(500).json({ error: 'Failed to save sessions' });
    }
});

// Save individual session
app.post('/api/sessions/:sessionId', async (req, res) => {
    try {
        const sessionId = req.params.sessionId;
        const sessionData = req.body;
        
        // Load existing sessions
        const data = await fs.readFile(SESSIONS_FILE, 'utf8');
        const sessions = JSON.parse(data);
        
        // Update specific session
        sessions[sessionId] = sessionData;
        
        // Save back to file
        await fs.writeFile(SESSIONS_FILE, JSON.stringify(sessions, null, 2));
        
        res.json({ success: true });
    } catch (error) {
        console.error('Error saving session:', error);
        res.status(500).json({ error: 'Failed to save session' });
    }
});

// Delete session
app.delete('/api/sessions/:sessionId', async (req, res) => {
    try {
        const sessionId = req.params.sessionId;
        
        // Load existing sessions
        const data = await fs.readFile(SESSIONS_FILE, 'utf8');
        const sessions = JSON.parse(data);
        
        // Delete session
        delete sessions[sessionId];
        
        // Save back to file
        await fs.writeFile(SESSIONS_FILE, JSON.stringify(sessions, null, 2));
        
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting session:', error);
        res.status(500).json({ error: 'Failed to delete session' });
    }
});

// Clear all sessions
app.delete('/api/sessions', async (req, res) => {
    try {
        await fs.writeFile(SESSIONS_FILE, JSON.stringify({}));
        res.json({ success: true });
    } catch (error) {
        console.error('Error clearing sessions:', error);
        res.status(500).json({ error: 'Failed to clear sessions' });
    }
});

// List backup files
app.get('/api/backups', async (req, res) => {
    try {
        const files = await fs.readdir(SESSIONS_DIR);
        const backups = files
            .filter(file => file.startsWith('backup-') && file.endsWith('.json'))
            .map(file => ({
                filename: file,
                created: file.replace('backup-', '').replace('.json', '').replace(/-/g, ':')
            }))
            .sort((a, b) => b.created.localeCompare(a.created));
        
        res.json(backups);
    } catch (error) {
        console.error('Error listing backups:', error);
        res.status(500).json({ error: 'Failed to list backups' });
    }
});

// Restore from backup
app.post('/api/restore/:filename', async (req, res) => {
    try {
        const filename = req.params.filename;
        const backupFile = path.join(SESSIONS_DIR, filename);
        
        // Read backup file
        const backupData = await fs.readFile(backupFile, 'utf8');
        
        // Write to main sessions file
        await fs.writeFile(SESSIONS_FILE, backupData);
        
        res.json({ success: true });
    } catch (error) {
        console.error('Error restoring backup:', error);
        res.status(500).json({ error: 'Failed to restore backup' });
    }
});

// Configuration management endpoints

// Get configuration
app.get('/api/config', async (req, res) => {
    try {
        let data;
        try {
            data = await fs.readFile(CONFIG_FILE, 'utf8');
        } catch (error) {
            if (error.code === 'ENOENT') {
                console.log('⚠️  Config file missing during runtime, recreating...');
                await ensureSessionsDir();
                data = await fs.readFile(CONFIG_FILE, 'utf8');
            } else {
                throw error;
            }
        }
        
        let config;
        try {
            config = JSON.parse(data);
            
            // Validate config structure
            if (!config || typeof config !== 'object' || 
                typeof config.serverUrl !== 'string' ||
                typeof config.model !== 'string' ||
                typeof config.systemPrompt !== 'string') {
                throw new Error('Invalid config structure');
            }
            
        } catch (parseError) {
            console.log('⚠️  Config file corrupted during runtime, recreating...');
            const defaultConfig = {
                serverUrl: 'http://localhost:11434',
                model: '',
                systemPrompt: '',
                lastUpdated: new Date().toISOString(),
                recreatedAt: new Date().toISOString()
            };
            await fs.writeFile(CONFIG_FILE, JSON.stringify(defaultConfig, null, 2));
            config = defaultConfig;
        }
        
        res.json(config);
    } catch (error) {
        console.error('Error loading config:', error);
        // Fallback to hardcoded default config
        const defaultConfig = {
            serverUrl: 'http://localhost:11434',
            model: '',
            systemPrompt: '',
            lastUpdated: new Date().toISOString(),
            fallback: true
        };
        res.json(defaultConfig);
    }
});

// Save configuration
app.post('/api/config', async (req, res) => {
    try {
        const config = {
            serverUrl: req.body.serverUrl || 'http://localhost:11434',
            model: req.body.model || '',
            systemPrompt: req.body.systemPrompt || '',
            lastUpdated: new Date().toISOString()
        };
        
        await fs.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2));
        
        console.log('Configuration saved:', {
            serverUrl: config.serverUrl,
            model: config.model,
            systemPromptLength: config.systemPrompt.length
        });
        
        res.json({ success: true, config });
    } catch (error) {
        console.error('Error saving config:', error);
        res.status(500).json({ error: 'Failed to save configuration' });
    }
});

// Export configuration
app.get('/api/config/export', async (req, res) => {
    try {
        const data = await fs.readFile(CONFIG_FILE, 'utf8');
        const config = JSON.parse(data);
        
        // Add export metadata
        config.exportDate = new Date().toISOString();
        config.exportVersion = '1.0';
        
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="ollama-config-${new Date().toISOString().slice(0, 10)}.json"`);
        res.send(JSON.stringify(config, null, 2));
    } catch (error) {
        console.error('Error exporting config:', error);
        res.status(500).json({ error: 'Failed to export configuration' });
    }
});

// Import configuration
app.post('/api/config/import', async (req, res) => {
    try {
        const importedConfig = req.body;
        
        // Validate imported config
        const config = {
            serverUrl: importedConfig.serverUrl || 'http://localhost:11434',
            model: importedConfig.model || '',
            systemPrompt: importedConfig.systemPrompt || '',
            lastUpdated: new Date().toISOString(),
            importedFrom: importedConfig.exportDate || 'unknown'
        };
        
        await fs.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2));
        
        console.log('Configuration imported successfully');
        res.json({ success: true, config });
    } catch (error) {
        console.error('Error importing config:', error);
        res.status(500).json({ error: 'Failed to import configuration' });
    }
});

// Vector Storage API endpoints
const VECTOR_STORAGE_DIR = path.join(__dirname, 'vector_storage');

// Ensure vector storage directory exists
async function ensureVectorStorageDir() {
    try {
        await fs.access(VECTOR_STORAGE_DIR);
    } catch {
        await fs.mkdir(VECTOR_STORAGE_DIR, { recursive: true });
        console.log('📁 Created vector_storage directory');
    }
}

// Save vector database to project folder
app.post('/api/vector-storage/save', async (req, res) => {
    try {
        await ensureVectorStorageDir();

        const { filename, data } = req.body;

        if (!filename || !data) {
            return res.status(400).json({ error: 'filename and data are required' });
        }

        // Ensure filename has .json extension
        const safeFilename = filename.endsWith('.json') ? filename : `${filename}.json`;
        const filePath = path.join(VECTOR_STORAGE_DIR, safeFilename);

        // Delete all previous .json files in vector_storage
        const files = await fs.readdir(VECTOR_STORAGE_DIR);
        const jsonFiles = files.filter(file => file.endsWith('.json'));
        for (const oldFile of jsonFiles) {
            const oldFilePath = path.join(VECTOR_STORAGE_DIR, oldFile);
            try {
                await fs.unlink(oldFilePath);
            } catch (err) {
                console.warn(`Warning: Failed to delete old vector db file ${oldFile}:`, err.message);
            }
        }

        // Write the new data to file
        await fs.writeFile(filePath, JSON.stringify(data, null, 2));

        console.log(`💾 Saved vector database: ${safeFilename}`);
        res.json({
            success: true,
            location: filePath,
            filename: safeFilename
        });
    } catch (error) {
        console.error('Error saving vector database:', error);
        res.status(500).json({ error: 'Failed to save vector database' });
    }
}
);

// List vector database files
app.get('/api/vector-storage/list', async (req, res) => {
    try {
        await ensureVectorStorageDir();
        
        const files = await fs.readdir(VECTOR_STORAGE_DIR);
        const jsonFiles = files.filter(file => file.endsWith('.json'));
        
        const fileList = await Promise.all(
            jsonFiles.map(async (filename) => {
                const filePath = path.join(VECTOR_STORAGE_DIR, filename);
                const stats = await fs.stat(filePath);
                return {
                    filename,
                    size: stats.size,
                    modified: stats.mtime.toISOString(),
                    created: stats.birthtime.toISOString()
                };
            })
        );
        
        // Sort by modification date (newest first)
        fileList.sort((a, b) => new Date(b.modified) - new Date(a.modified));
        
        res.json(fileList);
    } catch (error) {
        console.error('Error listing vector databases:', error);
        res.status(500).json({ error: 'Failed to list vector databases' });
    }
});

// Load vector database from project folder
app.get('/api/vector-storage/load/:filename', async (req, res) => {
    try {
        const { filename } = req.params;
        const filePath = path.join(VECTOR_STORAGE_DIR, filename);
        
        // Check if file exists
        await fs.access(filePath);
        
        // Read and parse the file
        const fileContent = await fs.readFile(filePath, 'utf8');
        const data = JSON.parse(fileContent);
        
        console.log(`📖 Loaded vector database: ${filename}`);
        res.json(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            res.status(404).json({ error: 'Vector database file not found' });
        } else {
            console.error('Error loading vector database:', error);
            res.status(500).json({ error: 'Failed to load vector database' });
        }
    }
});

// Delete vector database file
app.delete('/api/vector-storage/delete/:filename', async (req, res) => {
    try {
        const { filename } = req.params;
        const filePath = path.join(VECTOR_STORAGE_DIR, filename);
        
        // Check if file exists
        await fs.access(filePath);
        
        // Delete the file
        await fs.unlink(filePath);
        
        console.log(`🗑️ Deleted vector database: ${filename}`);
        res.json({ success: true, message: 'Vector database deleted' });
    } catch (error) {
        if (error.code === 'ENOENT') {
            res.status(404).json({ error: 'Vector database file not found' });
        } else {
            console.error('Error deleting vector database:', error);
            res.status(500).json({ error: 'Failed to delete vector database' });
        }
    }
});

// Start server
async function startServer() {
    await ensureSessionsDir();
    app.listen(PORT, () => {
        console.log(`🚀 Ollama Web UI Server running on http://localhost:${PORT}`);
        console.log(`📁 Sessions stored in: ${SESSIONS_DIR}`);
        console.log(`💾 Sessions file: ${SESSIONS_FILE}`);
    });
}

startServer().catch(console.error);
