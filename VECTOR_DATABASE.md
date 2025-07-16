# Vector Database Persistence

## Overview

The RAG system now includes persistent storage for the vector database, allowing your processed documents and embeddings to survive app restarts and be shared between sessions.

## Storage Methods

### 1. **Auto-Save (Browser Storage)**
- **Automatic**: Vector data is automatically saved to browser's localStorage after each document processing
- **Persistent**: Data survives browser refresh and app restarts
- **Location**: Browser's localStorage (`ollama-rag-backup`)
- **Capacity**: Limited by browser storage quotas (~5-10MB typically)

### 2. **File Export/Import**
- **Manual**: Export vector database to downloadable JSON files
- **Portable**: Share vector databases between different installations
- **Backup**: Create permanent backups of your processed documents
- **Format**: JSON file with complete vector database structure

## Usage

### Auto-Save Features
```javascript
// Auto-save happens automatically:
1. After processing each document
2. When clearing documents
3. On settings changes
```

### Manual Database Management

#### Export Vector Database
1. Click "Export DB" in the RAG panel
2. Downloads a JSON file with timestamp: `ollama-rag-vectordb-YYYY-MM-DD.json`
3. Contains: documents, chunks, embeddings, and settings

#### Import Vector Database
1. Click "Import DB" in the RAG panel
2. Select a previously exported JSON file
3. Replaces current vector database with imported data
4. Updates UI with loaded documents

#### Clear Database
1. Click "Clear DB" to remove all vector data
2. Clears both memory and persistent storage
3. Cannot be undone

## File Structure

The exported JSON file contains:

```json
{
  "version": "1.0",
  "timestamp": "2025-07-16T10:30:00.000Z",
  "settings": {
    "chunkSize": 1000,
    "chunkOverlap": 200,
    "embeddingModel": "nomic-embed-text"
  },
  "documents": [...],  // Document metadata
  "chunks": [...],     // Text chunks
  "embeddings": [...]  // Vector embeddings
}
```

## Benefits

### ✅ **Persistence**
- Documents survive app restarts
- No need to re-process files
- Preserves expensive embedding computations

### ✅ **Portability**
- Export/import between different setups
- Share processed datasets
- Create template databases

### ✅ **Performance**
- Instant startup with existing data
- No re-computation of embeddings
- Faster query responses

### ✅ **Reliability**
- Auto-backup prevents data loss
- Multiple storage methods
- Error recovery

## Storage Considerations

### Browser Storage Limits
- **Typical Limit**: 5-10MB per domain
- **Large Datasets**: Use file export for bigger collections
- **Monitoring**: Check browser developer tools for storage usage

### File Size Estimates
- **Text Document (10KB)**: ~50KB vector data
- **PDF (1MB)**: ~500KB-1MB vector data
- **Large Dataset (100 docs)**: ~50-100MB export file

## Best Practices

### 1. **Regular Exports**
```javascript
// Export weekly backups
saveVectorDatabase(); // Creates timestamped backup
```

### 2. **Organize by Project**
- Create separate exports for different projects
- Use descriptive filenames
- Keep settings consistent within projects

### 3. **Monitor Storage**
- Check browser storage usage regularly
- Export large datasets to files
- Clear old data when not needed

### 4. **Version Control**
- Keep track of export dates
- Document embedding model versions
- Note significant changes

## Migration Guide

### From Memory-Only to Persistent
1. Existing data auto-migrates to localStorage
2. Export current data as backup
3. Continue normal usage

### Between Different Systems
1. Export database from source system
2. Import on target system
3. Verify document counts match

## Troubleshooting

### Common Issues

#### **Storage Quota Exceeded**
```
Solution: Export data to file and clear browser storage
```

#### **Import Fails**
```
Check: File format, version compatibility, file corruption
```

#### **Auto-Save Not Working**
```
Check: Browser storage permissions, available space
```

#### **Performance Issues**
```
Solution: Reduce chunk size, export large datasets
```

### Recovery Methods

#### **Data Loss**
1. Check localStorage backup
2. Look for recent export files
3. Re-process critical documents

#### **Corrupted Storage**
1. Clear localStorage
2. Import from last known good export
3. Restart processing if needed

## Technical Details

### Storage Architecture
```
Memory (Runtime)     Browser Storage      File System
┌─────────────┐     ┌──────────────┐     ┌────────────┐
│ documents   │────▶│ localStorage │────▶│ JSON Export│
│ chunks      │     │ (auto-save)  │     │ (manual)   │
│ embeddings  │     └──────────────┘     └────────────┘
└─────────────┘
```

### Data Flow
1. **Load**: localStorage → Memory (startup)
2. **Process**: Document → Chunks → Embeddings → Memory
3. **Save**: Memory → localStorage (auto)
4. **Export**: Memory → JSON File (manual)
5. **Import**: JSON File → Memory + localStorage

## API Reference

### RAGProcessor Methods
```javascript
// Save to file
await ragProcessor.saveToStorage()

// Load from file
await ragProcessor.loadFromFile(file)

// Auto-save to localStorage
await ragProcessor.autoSave()

// Load from localStorage
await ragProcessor.loadFromStorage()

// Clear persistent storage
ragProcessor.clearStorage()
```

This persistent vector database system ensures your RAG data is preserved and portable while maintaining high performance and reliability.
