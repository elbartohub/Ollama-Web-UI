// PDF Processing Utilities for RAG
// This is a simplified PDF processor. For production use, integrate PDF.js or a server-side PDF parser.

class SimplePDFProcessor {
    constructor() {
        this.isSupported = typeof pdfjsLib !== 'undefined';
    }

    // Check if PDF processing is available
    isPDFSupported() {
        return this.isSupported;
    }

    // Process PDF file (simplified version)
    async processPDF(file) {
        if (!this.isSupported) {
            return this.getFallbackMessage();
        }

        try {
            // This would be the PDF.js integration
            // For now, return a placeholder
            const arrayBuffer = await this.fileToArrayBuffer(file);
            
            // In a real implementation, you would use PDF.js here:
            // const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
            // let fullText = '';
            // for (let i = 1; i <= pdf.numPages; i++) {
            //     const page = await pdf.getPage(i);
            //     const textContent = await page.getTextContent();
            //     const pageText = textContent.items.map(item => item.str).join(' ');
            //     fullText += pageText + '\n';
            // }
            
            return this.getFallbackMessage();
        } catch (error) {
            console.error('Error processing PDF:', error);
            throw new Error('Failed to process PDF file: ' + error.message);
        }
    }

    // Convert file to ArrayBuffer
    fileToArrayBuffer(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsArrayBuffer(file);
        });
    }

    // Fallback message when PDF.js is not available
    getFallbackMessage() {
        return `
PDF Processing Not Available

To enable PDF processing in this RAG system, you have several options:

1. RECOMMENDED - Server-side processing:
   - Use a server-side library like Apache Tika, PyPDF2, or pdf-parse
   - Convert PDF to text before uploading
   - This provides the most reliable results

2. Client-side with PDF.js:
   - Include PDF.js library: https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js
   - Add to your HTML: <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
   - This allows processing PDFs directly in the browser

3. Manual conversion:
   - Convert your PDF to TXT format using online tools or software
   - Upload the TXT file instead of the PDF

For now, please convert your PDF files to TXT format and upload them to use with RAG.

Technical Details:
- File: ${this.fileName || 'PDF file'}
- Size: ${this.fileSize || 'Unknown'}
- Status: PDF processing requires additional setup
        `.trim();
    }

    // Set file info for fallback message
    setFileInfo(fileName, fileSize) {
        this.fileName = fileName;
        this.fileSize = this.formatFileSize(fileSize);
    }

    // Format file size
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// Export for use in RAG processor
window.SimplePDFProcessor = SimplePDFProcessor;
