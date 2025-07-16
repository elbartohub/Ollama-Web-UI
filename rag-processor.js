// RAG Document Processing Module
class RAGProcessor {
    constructor() {
        this.documents = new Map(); // Store processed documents
        this.chunks = new Map(); // Store document chunks
        this.embeddings = new Map(); // Store chunk embeddings
        this.vectorIndex = new Map(); // Simple vector index
        this.chunkSize = 1000; // Default chunk size
        this.chunkOverlap = 200; // Default overlap
        this.embeddingModel = 'nomic-embed-text'; // Default embedding model
        
        // Persistent storage settings
        this.persistentStorage = true; // Enable file-based persistence
        this.storageFolder = 'vector_storage'; // Project subfolder for storage
        
        // Initialize PDF processor
        this.pdfProcessor = typeof SimplePDFProcessor !== 'undefined' ? new SimplePDFProcessor() : null;
    }

    // Process uploaded files based on type
    async processFile(file) {
        const fileId = this.generateFileId(file);
        const fileType = this.getFileType(file);
        
        console.log(`Processing ${fileType} file:`, file.name);
        
        try {
            let content = '';
            
            switch (fileType) {
                case 'pdf':
                    content = await this.processPDF(file);
                    break;
                case 'csv':
                    content = await this.processCSV(file);
                    break;
                case 'json':
                    content = await this.processJSON(file);
                    break;
                case 'txt':
                    content = await this.processText(file);
                    break;
                default:
                    throw new Error(`Unsupported file type: ${fileType}`);
            }
            
            // Store document
            this.documents.set(fileId, {
                id: fileId,
                name: file.name,
                type: fileType,
                content: content,
                size: file.size,
                uploadedAt: new Date().toISOString()
            });
            
            // Create chunks
            const chunks = this.createChunks(content, fileId);
            this.chunks.set(fileId, chunks);
            
            // Generate embeddings for chunks
            await this.generateEmbeddings(fileId, chunks);
            
            // Auto-save after successful processing
            await this.autoSave();
            
            console.log(`Processed file: ${file.name}, chunks: ${chunks.length}`);
            return {
                fileId: fileId,
                name: file.name,
                chunks: chunks.length,
                success: true
            };
            
        } catch (error) {
            console.error('Error processing file:', error);
            return {
                fileId: fileId,
                name: file.name,
                error: error.message,
                success: false
            };
        }
    }

    // Process PDF files (simplified - you'll need a PDF library like PDF.js)
    async processPDF(file) {
        if (this.pdfProcessor) {
            this.pdfProcessor.setFileInfo(file.name, file.size);
            return await this.pdfProcessor.processPDF(file);
        } else {
            // Fallback when PDF processor is not available
            return `PDF Processing Not Available

To process PDF files, please:
1. Convert your PDF to TXT format using online tools or software
2. Upload the TXT file instead

For production use, integrate PDF.js library or use server-side PDF processing.

File: ${file.name}
Size: ${this.formatFileSize(file.size)}`;
        }
    }

    // Process CSV files
    async processCSV(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const csvContent = e.target.result;
                    const lines = csvContent.split('\n');
                    let processedContent = '';
                    
                    // Process CSV with headers
                    if (lines.length > 0) {
                        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
                        
                        for (let i = 1; i < lines.length; i++) {
                            if (lines[i].trim()) {
                                const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
                                const rowData = {};
                                
                                headers.forEach((header, index) => {
                                    rowData[header] = values[index] || '';
                                });
                                
                                // Convert row to readable text
                                const rowText = headers.map(header => 
                                    `${header}: ${rowData[header]}`
                                ).join(', ');
                                
                                processedContent += `Row ${i}: ${rowText}\n`;
                            }
                        }
                    }
                    
                    resolve(processedContent);
                } catch (error) {
                    reject(new Error('Failed to parse CSV: ' + error.message));
                }
            };
            reader.onerror = () => reject(new Error('Failed to read CSV file'));
            reader.readAsText(file, 'utf-8');
        });
    }

    // Process JSON files
    async processJSON(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const jsonContent = JSON.parse(e.target.result);
                    const processedContent = this.jsonToText(jsonContent);
                    resolve(processedContent);
                } catch (error) {
                    reject(new Error('Failed to parse JSON: ' + error.message));
                }
            };
            reader.onerror = () => reject(new Error('Failed to read JSON file'));
            reader.readAsText(file, 'utf-8');
        });
    }

    // Process text files (including Chinese)
    async processText(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                resolve(e.target.result);
            };
            reader.onerror = () => reject(new Error('Failed to read text file'));
            reader.readAsText(file, 'utf-8');
        });
    }

    // Convert JSON object to readable text
    jsonToText(obj, prefix = '') {
        let text = '';
        
        if (Array.isArray(obj)) {
            obj.forEach((item, index) => {
                text += `${prefix}[${index}]: ${this.jsonToText(item, prefix + '  ')}\n`;
            });
        } else if (typeof obj === 'object' && obj !== null) {
            Object.entries(obj).forEach(([key, value]) => {
                if (typeof value === 'object') {
                    text += `${prefix}${key}:\n${this.jsonToText(value, prefix + '  ')}`;
                } else {
                    text += `${prefix}${key}: ${value}\n`;
                }
            });
        } else {
            text += `${prefix}${obj}\n`;
        }
        
        return text;
    }

    // Create overlapping chunks from content
    createChunks(content, fileId) {
        // Helper: detect if content is mostly CJK (Chinese/Japanese/Korean)
        function isMostlyCJK(text) {
            // CJK unicode range: \u4E00-\u9FFF (Chinese), \u3040-\u30FF (Japanese), \uAC00-\uD7AF (Korean)
            const cjk = text.match(/[\u4E00-\u9FFF\u3040-\u30FF\uAC00-\uD7AF]/g);
            return cjk && cjk.length > text.length * 0.3; // 30%+ CJK chars
        }

        const chunks = [];
        const useCharChunking = isMostlyCJK(content);
        let chunkIndex = 0;

        if (useCharChunking) {
            // Character-based chunking with overlap (for CJK, no skip)
            let i = 0;
            const totalLen = content.length;
            while (i < totalLen) {
                let end = i + this.chunkSize;
                if (end > totalLen) end = totalLen;
                const chunk = content.slice(i, end);
                if (chunk.trim().length > 0) {
                    chunks.push({
                        id: `${fileId}_chunk_${chunkIndex}`,
                        fileId: fileId,
                        index: chunkIndex,
                        content: chunk.trim(),
                        length: chunk.length,
                        startChar: i,
                        endChar: end - 1
                    });
                    chunkIndex++;
                }
                // Always move forward by chunkSize - chunkOverlap, but never skip any content
                if (i + this.chunkSize >= totalLen) break;
                i += this.chunkSize - this.chunkOverlap;
                if (i < 0 || i >= totalLen) break;
            }
        } else {
            // Original sentence-based chunking (for non-CJK)
            const sentences = this.splitIntoSentences(content);
            let currentChunk = '';
            let currentLength = 0;
            for (let i = 0; i < sentences.length; i++) {
                const sentence = sentences[i];
                // If adding this sentence would exceed chunk size, finalize current chunk
                if (currentLength + sentence.length > this.chunkSize && currentChunk.length > 0) {
                    chunks.push({
                        id: `${fileId}_chunk_${chunkIndex}`,
                        fileId: fileId,
                        index: chunkIndex,
                        content: currentChunk.trim(),
                        length: currentLength,
                        startSentence: Math.max(0, i - Math.floor(currentChunk.split('.').length)),
                        endSentence: i - 1
                    });
                    // Start new chunk with overlap
                    const overlapSentences = this.getOverlapSentences(sentences, i, this.chunkOverlap);
                    currentChunk = overlapSentences.join(' ');
                    currentLength = currentChunk.length;
                    chunkIndex++;
                } else {
                    currentChunk += (currentChunk ? ' ' : '') + sentence;
                    currentLength += sentence.length;
                }
            }
            // Add final chunk if it has content
            if (currentChunk.trim()) {
                chunks.push({
                    id: `${fileId}_chunk_${chunkIndex}`,
                    fileId: fileId,
                    index: chunkIndex,
                    content: currentChunk.trim(),
                    length: currentLength,
                    startSentence: Math.max(0, sentences.length - Math.floor(currentChunk.split('.').length)),
                    endSentence: sentences.length - 1
                });
            }
        }
        return chunks;
    }

    // Split content into sentences (handles Chinese punctuation)
    splitIntoSentences(content) {
        // Handle both English and Chinese sentence endings
        const sentenceEndings = /[.!?。！？]/;
        const sentences = [];
        let currentSentence = '';
        
        for (let i = 0; i < content.length; i++) {
            const char = content[i];
            currentSentence += char;
            
            if (sentenceEndings.test(char)) {
                // Look ahead to see if there are more punctuation marks
                let j = i + 1;
                while (j < content.length && /\s/.test(content[j])) {
                    currentSentence += content[j];
                    j++;
                }
                
                if (currentSentence.trim()) {
                    sentences.push(currentSentence.trim());
                }
                currentSentence = '';
                i = j - 1;
            }
        }
        
        // Add remaining content as final sentence
        if (currentSentence.trim()) {
            sentences.push(currentSentence.trim());
        }
        
        return sentences;
    }

    // Get overlap sentences for chunk continuity
    getOverlapSentences(sentences, startIndex, overlapLength) {
        const overlapSentences = [];
        let overlapChars = 0;
        
        for (let i = startIndex - 1; i >= 0 && overlapChars < overlapLength; i--) {
            const sentence = sentences[i];
            if (overlapChars + sentence.length <= overlapLength) {
                overlapSentences.unshift(sentence);
                overlapChars += sentence.length;
            } else {
                break;
            }
        }
        
        return overlapSentences;
    }

    // Generate embeddings for chunks using Ollama
    async generateEmbeddings(fileId, chunks) {
        const embeddings = [];
        const serverUrl = document.getElementById('serverIp')?.value || 'http://localhost:11434';
        
        try {
            for (const chunk of chunks) {
                console.log(`Generating embedding for chunk ${chunk.index}...`);
                
                const response = await fetch(`${serverUrl}/api/embeddings`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        model: this.embeddingModel,
                        prompt: chunk.content
                    })
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                embeddings.push({
                    chunkId: chunk.id,
                    embedding: data.embedding,
                    norm: this.calculateNorm(data.embedding)
                });
            }
            
            this.embeddings.set(fileId, embeddings);
            console.log(`Generated ${embeddings.length} embeddings for file ${fileId}`);
            
        } catch (error) {
            console.error('Error generating embeddings:', error);
            throw error;
        }
    }

    // Calculate vector norm for normalization
    calculateNorm(vector) {
        return Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    }

    // Calculate cosine similarity between two vectors
    cosineSimilarity(vectorA, vectorB) {
        const dotProduct = vectorA.reduce((sum, a, i) => sum + a * vectorB[i], 0);
        const normA = this.calculateNorm(vectorA);
        const normB = this.calculateNorm(vectorB);
        return dotProduct / (normA * normB);
    }

    // Search for relevant chunks based on query
    async searchRelevantChunks(query, topK = 5) {
        try {
            // Generate embedding for query
            const serverUrl = document.getElementById('serverIp')?.value || 'http://localhost:11434';
            
            const response = await fetch(`${serverUrl}/api/embeddings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: this.embeddingModel,
                    prompt: query
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            const queryEmbedding = data.embedding;
            
            // Calculate similarities with all chunks
            const similarities = [];
            
            for (const [fileId, fileEmbeddings] of this.embeddings.entries()) {
                const fileChunks = this.chunks.get(fileId);
                
                fileEmbeddings.forEach((embeddingData, index) => {
                    const similarity = this.cosineSimilarity(queryEmbedding, embeddingData.embedding);
                    const chunk = fileChunks[index];
                    
                    similarities.push({
                        chunk: chunk,
                        similarity: similarity,
                        fileId: fileId,
                        fileName: this.documents.get(fileId)?.name
                    });
                });
            }
            
            // Sort by similarity and return top K
            similarities.sort((a, b) => b.similarity - a.similarity);
            return similarities.slice(0, topK);
            
        } catch (error) {
            console.error('Error searching chunks:', error);
            return [];
        }
    }

    // Generate file ID
    generateFileId(file) {
        return `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // Get file type from file name
    getFileType(file) {
        const extension = file.name.split('.').pop().toLowerCase();
        const typeMap = {
            'pdf': 'pdf',
            'csv': 'csv',
            'json': 'json',
            'txt': 'txt',
            'text': 'txt'
        };
        return typeMap[extension] || 'txt';
    }

    // Get all processed documents
    getDocuments() {
        return Array.from(this.documents.values());
    }

    // Remove document and its chunks
    removeDocument(fileId) {
        this.documents.delete(fileId);
        this.chunks.delete(fileId);
        this.embeddings.delete(fileId);
    }

    // Clear all documents
    clearAll() {
        this.documents.clear();
        this.chunks.clear();
        this.embeddings.clear();
        // Auto-save empty state
        this.autoSave();
    }

    // Get processing statistics
    getStats() {
        const totalDocuments = this.documents.size;
        let totalChunks = 0;
        let totalEmbeddings = 0;
        
        for (const chunks of this.chunks.values()) {
            totalChunks += chunks.length;
        }
        
        for (const embeddings of this.embeddings.values()) {
            totalEmbeddings += embeddings.length;
        }
        
        return {
            totalDocuments,
            totalChunks,
            totalEmbeddings,
            chunkSize: this.chunkSize,
            chunkOverlap: this.chunkOverlap,
            embeddingModel: this.embeddingModel
        };
    }

    // Update settings
    updateSettings(settings) {
        if (settings.chunkSize) this.chunkSize = settings.chunkSize;
        if (settings.chunkOverlap) this.chunkOverlap = settings.chunkOverlap;
        if (settings.embeddingModel) this.embeddingModel = settings.embeddingModel;
    }

    // Format file size helper
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Persistent Storage Methods
    
    // Save vector database to project folder
    async saveToStorage() {
        if (!this.persistentStorage) return;
        
        try {
            const data = {
                version: '1.0',
                timestamp: new Date().toISOString(),
                settings: {
                    chunkSize: this.chunkSize,
                    chunkOverlap: this.chunkOverlap,
                    embeddingModel: this.embeddingModel
                },
                documents: Array.from(this.documents.entries()),
                chunks: Array.from(this.chunks.entries()),
                embeddings: Array.from(this.embeddings.entries())
            };
            
            // Use date and time for unique filename
            const now = new Date();
            const dateStr = now.toISOString().split('T')[0];
            const timeStr = now.toISOString().split('T')[1].replace(/[:.]/g, '-').replace('Z', '');
            const filename = `ollama-rag-vectordb-${dateStr}_${timeStr}.json`;
            
            // Save to project folder via backend
            try {
                const response = await fetch('/api/vector-storage/save', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        filename: filename,
                        data: data
                    })
                });
                
                if (response.ok) {
                    const result = await response.json();
                    console.log(`Vector database saved to project folder: ${result.filename}`);
                    return { success: true, location: 'project_folder', filepath: result.location };
                } else {
                    throw new Error(`Backend save failed: ${response.status}`);
                }
            } catch (backendError) {
                console.error('Failed to save to project folder:', backendError.message);
                throw new Error('Project folder storage not available. Please ensure the backend server is running.');
            }
            
        } catch (error) {
            console.error('Error saving vector database:', error);
            return { success: false, error: error.message };
        }
    }
    
    // Load vector database from file
    async loadFromFile(file) {
        try {
            const text = await file.text();
            const data = JSON.parse(text);
            
            // Validate data structure
            if (!data.version || !data.documents || !data.chunks || !data.embeddings) {
                throw new Error('Invalid vector database file format');
            }
            
            // Clear existing data
            this.documents.clear();
            this.chunks.clear();
            this.embeddings.clear();
            
            // Load data
            this.documents = new Map(data.documents);
            this.chunks = new Map(data.chunks);
            this.embeddings = new Map(data.embeddings);
            
            // Update settings if available
            if (data.settings) {
                this.chunkSize = data.settings.chunkSize || this.chunkSize;
                this.chunkOverlap = data.settings.chunkOverlap || this.chunkOverlap;
                this.embeddingModel = data.settings.embeddingModel || this.embeddingModel;
            }
            
            console.log(`Vector database loaded: ${this.documents.size} documents, ${this.getTotalChunks()} chunks`);
            return true;
        } catch (error) {
            console.error('Error loading vector database:', error);
            return false;
        }
    }
    
    // Load vector database from data object (for project folder loading)
    async loadFromData(data) {
        try {
            // Validate data structure
            if (!data.version || !data.documents || !data.chunks || !data.embeddings) {
                throw new Error('Invalid vector database data format');
            }
            
            // Clear existing data
            this.documents.clear();
            this.chunks.clear();
            this.embeddings.clear();
            
            // Load data
            this.documents = new Map(data.documents);
            this.chunks = new Map(data.chunks);
            this.embeddings = new Map(data.embeddings);
            
            // Update settings if available
            if (data.settings) {
                this.chunkSize = data.settings.chunkSize || this.chunkSize;
                this.chunkOverlap = data.settings.chunkOverlap || this.chunkOverlap;
                this.embeddingModel = data.settings.embeddingModel || this.embeddingModel;
            }
            
            console.log(`Vector database loaded from project: ${this.documents.size} documents, ${this.getTotalChunks()} chunks`);
            
            return true;
        } catch (error) {
            console.error('Error loading vector database from data:', error);
            return false;
        }
    }
    
    // Auto-save after processing
    async autoSave() {
        if (this.persistentStorage && this.documents.size > 0) {
            // Auto-save to project folder
            await this.saveToStorage();
        }
    }
    
    // Load from project folder on startup
    async loadFromStorage() {
        console.log('RAG: Starting loadFromStorage...');
        try {
            console.log('RAG: Fetching vector storage list...');
            const response = await fetch('/api/vector-storage/list');
            if (response.ok) {
                console.log('RAG: Vector storage list fetched successfully');
                const files = await response.json();
                console.log('RAG: Found', files.length, 'vector database files');
                
                if (files.length > 0) {
                    // Load the most recent file (first in the array since it's sorted newest first)
                    const latestFile = files[0];
                    console.log('RAG: Loading latest file:', latestFile.filename);
                    
                    const loadResponse = await fetch(`/api/vector-storage/load/${latestFile.filename}`);
                    if (loadResponse.ok) {
                        console.log('RAG: File loaded successfully');
                        const data = await loadResponse.json();
                        
                        this.documents = new Map(data.documents || []);
                        this.chunks = new Map(data.chunks || []);
                        this.embeddings = new Map(data.embeddings || []);
                        
                        if (data.settings) {
                            this.chunkSize = data.settings.chunkSize || this.chunkSize;
                            this.chunkOverlap = data.settings.chunkOverlap || this.chunkOverlap;
                            this.embeddingModel = data.settings.embeddingModel || this.embeddingModel;
                        }
                        
                        console.log(`RAG: Auto-loaded from project folder: ${latestFile.filename} (${this.documents.size} documents)`);
                        
                        return;
                    } else {
                        console.error('RAG: Failed to load file:', loadResponse.status);
                    }
                } else {
                    console.log('RAG: No vector database files found in project folder');
                }
            } else {
                console.error('RAG: Failed to fetch vector storage list:', response.status);
            }
        } catch (error) {
            console.log('RAG: Project folder storage not available:', error.message);
            console.log('RAG: Please ensure the backend server is running for vector database persistence');
        }
    }
    
    // Clear project folder storage
    async clearStorage() {
        try {
            // Get list of files and delete them
            const response = await fetch('/api/vector-storage/list');
            if (response.ok) {
                const files = await response.json();
                for (const file of files) {
                    await fetch(`/api/vector-storage/delete/${file.filename}`, {
                        method: 'DELETE'
                    });
                }
                console.log('Project folder storage cleared');
            }
        } catch (error) {
            console.warn('Failed to clear project storage:', error);
        }
    }
}

// Export for use in main script
window.RAGProcessor = RAGProcessor;
