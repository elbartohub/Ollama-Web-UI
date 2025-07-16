# RAG (Retrieval-Augmented Generation) Enhancement

This document describes the new RAG functionality added to the Ollama Web UI, which allows you to upload documents and enhance AI responses with relevant context from your document collection.

## Features

### Supported File Formats
- **PDF**: Portable Document Format (requires additional setup)
- **CSV**: Comma-Separated Values with automatic parsing
- **JSON**: JavaScript Object Notation with hierarchical processing
- **TXT**: Plain text files (including Chinese/Unicode content)

### Core Capabilities
- **Intelligent Chunking**: Documents are split into overlapping chunks for better context preservation
- **Vector Embeddings**: Uses Ollama's embedding models to create searchable vector representations
- **Semantic Search**: Finds relevant document chunks based on query similarity
- **Multi-language Support**: Full support for Chinese and other Unicode text
- **Real-time Processing**: Documents are processed and embedded immediately upon upload

## How It Works

### 1. Document Processing Pipeline
1. **File Upload**: Drag and drop or click to upload supported files
2. **Content Extraction**: Text is extracted based on file type
3. **Chunking**: Content is split into overlapping segments (default: 1000 chars with 200 char overlap)
4. **Embedding**: Each chunk is converted to a vector embedding using Ollama
5. **Indexing**: Embeddings are stored for fast similarity search

### 2. RAG-Enhanced Chat
1. **Query Processing**: User's message is converted to an embedding
2. **Similarity Search**: Top-K most relevant chunks are retrieved
3. **Context Injection**: Relevant chunks are added to the AI prompt
4. **Enhanced Response**: AI generates responses using both conversation history and document context

## Usage Guide

### Getting Started
1. **Open RAG Panel**: Click the database icon (📊) in the header or use the floating toggle button
2. **Configure Settings**: Adjust chunk size, overlap, and embedding model as needed
3. **Upload Documents**: Drag files to the upload area or click to browse
4. **Wait for Processing**: Documents will be chunked and embedded automatically
5. **Start Chatting**: Your conversations will now be enhanced with relevant document context

### Settings Configuration
- **Chunk Size**: Size of text segments (100-4000 characters)
- **Chunk Overlap**: Overlap between chunks to preserve context (0-500 characters)
- **Embedding Model**: Choose from available Ollama embedding models
  - `nomic-embed-text` (default, good for general use)
  - `mxbai-embed-large` (larger model, better accuracy)
  - `all-minilm` (smaller, faster)

### File Type Specifics

#### CSV Files
- Headers are automatically detected
- Each row is converted to readable text format
- Structure: "Column1: Value1, Column2: Value2, ..."

#### JSON Files  
- Hierarchical structure is preserved
- Arrays and objects are flattened to readable text
- Nested structures maintain their relationships

#### TXT Files
- Direct text processing with Unicode support
- Preserves formatting and structure
- Excellent for documentation, articles, and notes

#### PDF Files
- **Note**: PDF processing requires additional setup
- Currently shows instructions for enabling PDF support
- Options include:
  - Server-side processing (recommended)
  - PDF.js integration for client-side processing
  - Manual conversion to TXT format

## Technical Details

### Architecture
- **Frontend**: JavaScript-based document processing and UI
- **Backend**: Leverages Ollama's embedding API
- **Storage**: In-memory vector index with persistent document storage
- **Search**: Cosine similarity for semantic matching

### Performance Considerations
- **Memory Usage**: Embeddings are stored in browser memory
- **Processing Time**: Depends on document size and embedding model
- **Embedding Quality**: Larger models provide better semantic understanding

### Embedding Models
The system supports various Ollama embedding models:

```javascript
// Default configuration
embeddingModel: 'nomic-embed-text'

// Available models
- nomic-embed-text: General purpose, good balance
- mxbai-embed-large: Higher accuracy, slower processing  
- all-minilm: Faster processing, smaller size
```

## API Integration

### RAG Processor Methods
```javascript
// Initialize processor
const ragProcessor = new RAGProcessor();

// Process a file
const result = await ragProcessor.processFile(file);

// Search for relevant chunks
const chunks = await ragProcessor.searchRelevantChunks(query, topK);

// Update settings
ragProcessor.updateSettings({
    chunkSize: 1500,
    chunkOverlap: 300,
    embeddingModel: 'mxbai-embed-large'
});
```

### Event Handlers
```javascript
// File upload handling
document.getElementById('ragFileInput').addEventListener('change', handleRAGFileUpload);

// Drag and drop support
ragUploadArea.addEventListener('drop', handleRAGFiles);
```

## Best Practices

### Document Preparation
1. **Clean Text**: Remove unnecessary formatting and headers
2. **Logical Structure**: Organize content in coherent sections
3. **Appropriate Size**: Keep documents focused and relevant
4. **Multiple Files**: Split large documents into logical chapters/sections

### Chunking Strategy
1. **Size Selection**: 
   - Small chunks (500-800): Better precision, may lose context
   - Large chunks (1200-2000): Better context, may reduce precision
2. **Overlap Configuration**:
   - Low overlap (100-150): Faster processing, risk of context loss
   - High overlap (250-400): Better context preservation, more storage

### Performance Optimization
1. **Batch Processing**: Upload related documents together
2. **Model Selection**: Choose embedding model based on accuracy vs. speed needs
3. **Regular Cleanup**: Remove outdated documents to maintain performance

## Troubleshooting

### Common Issues

#### PDF Processing Not Working
- **Cause**: PDF.js library not included
- **Solution**: Add PDF.js script or convert PDFs to TXT format

#### Embedding Generation Fails
- **Cause**: Ollama server not running or embedding model not available
- **Solution**: Ensure Ollama is running and the selected embedding model is installed

#### Poor Search Results
- **Cause**: Inappropriate chunk size or embedding model mismatch
- **Solution**: Experiment with different chunk sizes and try a different embedding model

#### Memory Issues
- **Cause**: Too many large documents loaded
- **Solution**: Clear documents periodically or reduce document size

### Error Messages

#### "RAG processor not initialized"
- Refresh the page to reinitialize the system
- Check browser console for JavaScript errors

#### "Failed to generate embeddings"
- Verify Ollama server is accessible
- Check if the embedding model is installed: `ollama pull nomic-embed-text`

#### "Processing failed"
- Check file format and size
- Ensure file is not corrupted

## Advanced Configuration

### Custom Embedding Models
To use custom embedding models:

1. Install the model in Ollama:
   ```bash
   ollama pull your-custom-model
   ```

2. Update the embedding model in RAG settings:
   ```javascript
   ragProcessor.updateSettings({
       embeddingModel: 'your-custom-model'
   });
   ```

### Server-Side PDF Processing
For production PDF support, implement server-side processing:

1. **Python with PyPDF2**:
   ```python
   import PyPDF2
   def extract_pdf_text(file_path):
       with open(file_path, 'rb') as file:
           reader = PyPDF2.PdfReader(file)
           text = ""
           for page in reader.pages:
               text += page.extract_text()
       return text
   ```

2. **Node.js with pdf-parse**:
   ```javascript
   const pdf = require('pdf-parse');
   const fs = require('fs');
   
   const dataBuffer = fs.readFileSync('document.pdf');
   pdf(dataBuffer).then(function(data) {
       console.log(data.text);
   });
   ```

## File Structure

```
/Volumes/2TLexarNM610Pro/AI/Ollama-Web-UI/
├── rag-processor.js      # Main RAG processing logic
├── rag-styles.css        # RAG interface styles
├── pdf-processor.js      # PDF processing utilities
├── index.html           # Updated with RAG interface
├── script.js            # Updated with RAG integration
└── styles.css           # Updated with RAG button styles
```

## Future Enhancements

### Planned Features
- **Vector Database Integration**: PostgreSQL with pgvector or ChromaDB
- **Advanced PDF Processing**: Full PDF.js integration with OCR support
- **Document Versioning**: Track document changes and updates
- **Batch Operations**: Process multiple files simultaneously
- **Export/Import**: Save and restore document collections
- **Analytics**: Usage statistics and search performance metrics

### Contributing
To extend the RAG functionality:

1. **New File Types**: Add processors in `rag-processor.js`
2. **Better Chunking**: Implement smarter chunking strategies
3. **UI Improvements**: Enhance the RAG panel interface
4. **Performance**: Optimize vector search and storage

This RAG enhancement significantly improves the AI assistant's ability to provide contextually relevant responses based on your document collection, making it a powerful tool for document-based question answering and research assistance.
