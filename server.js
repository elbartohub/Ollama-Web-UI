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
app.use(express.json());
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
