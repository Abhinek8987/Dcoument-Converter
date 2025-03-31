document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const uploadArea = document.getElementById('upload-area');
    const fileInput = document.getElementById('file-input');
    const fileList = document.getElementById('file-list');
    const convertBtn = document.getElementById('convert-btn');
    const statusMessage = document.getElementById('status-message');
    const progressFill = document.getElementById('progress-bar-fill');
    const uploadedCount = document.getElementById('uploaded-count');
    const convertedCount = document.getElementById('converted-count');
    const statsDisplay = document.getElementById('stats');
    const docxToPdfBtn = document.getElementById('docx-to-pdf');
    const pdfToDocxBtn = document.getElementById('pdf-to-docx');
    
    let conversionType = 'docx_to_pdf';
    let files = [];

    // Initialize UI
    function initializeUI() {
        fileList.innerHTML = '';
        statusMessage.textContent = 'Ready for conversion';
        statusMessage.className = 'status-message';
        progressFill.style.width = '0%';
        convertBtn.disabled = true;
        statsDisplay.style.display = 'none';
    }

    // Update file input accept attribute based on conversion type
    function updateFileInputAccept() {
        fileInput.accept = conversionType === 'docx_to_pdf' ? '.doc,.docx' : '.pdf';
    }

    // Format file size
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }

    // Update individual file status
    function updateFileStatus(index, status, isSuccess) {
        const fileItems = document.querySelectorAll('.file-item');
        if (fileItems[index]) {
            const statusElement = fileItems[index].querySelector('.file-status');
            if (statusElement) {
                statusElement.textContent = status;
                statusElement.className = 'file-status ' + 
                    (isSuccess ? 'status-success' : 
                     status === 'Processing' ? 'status-processing' : 
                     status === 'Failed' ? 'status-error' : 'status-ready');
            }
        }
    }

    // Handle file selection
    function handleFiles(selectedFiles) {
        files = Array.from(selectedFiles);
        initializeUI();
        
        if (files.length === 0) {
            return;
        }

        const allowedExtensions = conversionType === 'docx_to_pdf' ? ['doc', 'docx'] : ['pdf'];
        let validFiles = 0;

        files.forEach((file, index) => {
            const ext = file.name.split('.').pop().toLowerCase();
            
            if (allowedExtensions.includes(ext)) {
                validFiles++;
                
                const fileItem = document.createElement('div');
                fileItem.className = 'file-item';
                fileItem.innerHTML = `
                    <div class="file-name">${file.name}</div>
                    <div class="file-size">${formatFileSize(file.size)}</div>
                    <div class="file-status status-ready">Ready</div>
                `;
                fileList.appendChild(fileItem);
            }
        });

        if (validFiles > 0) {
            convertBtn.disabled = false;
            statusMessage.textContent = `Ready to convert ${validFiles} file(s)`;
            uploadedCount.textContent = validFiles;
            convertedCount.textContent = '0';
            statsDisplay.style.display = 'flex';
        } else {
            statusMessage.textContent = conversionType === 'docx_to_pdf' 
                ? 'Only .doc and .docx files are allowed' 
                : 'Only .pdf files are allowed';
            statusMessage.className = 'status-message error';
        }
    }

    // Drag and drop functionality
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        uploadArea.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, unhighlight, false);
    });

    function highlight() {
        uploadArea.classList.add('highlight');
    }

    function unhighlight() {
        uploadArea.classList.remove('highlight');
    }

    uploadArea.addEventListener('drop', e => {
        const dt = e.dataTransfer;
        fileInput.files = dt.files;
        handleFiles(dt.files);
    });

    uploadArea.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', () => handleFiles(fileInput.files));

    // Conversion type toggle
    docxToPdfBtn.addEventListener('click', () => {
        conversionType = 'docx_to_pdf';
        docxToPdfBtn.classList.add('active');
        pdfToDocxBtn.classList.remove('active');
        updateFileInputAccept();
        initializeUI();
    });

    pdfToDocxBtn.addEventListener('click', () => {
        conversionType = 'pdf_to_docx';
        pdfToDocxBtn.classList.add('active');
        docxToPdfBtn.classList.remove('active');
        updateFileInputAccept();
        initializeUI();
    });

    // Convert files
    convertBtn.addEventListener('click', async () => {
        if (files.length === 0) return;

        convertBtn.disabled = true;
        statusMessage.textContent = 'Converting files...';
        statusMessage.className = 'status-message processing';
        progressFill.style.width = '10%';

        // Update all files to processing status
        files.forEach((_, index) => {
            updateFileStatus(index, 'Processing', false);
        });

        const formData = new FormData();
        formData.append('conversion_type', conversionType);
        files.forEach(file => formData.append('files', file));

        try {
            const response = await fetch('/', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (response.ok) {
                // Update UI with successful conversion
                progressFill.style.width = '100%';
                statusMessage.textContent = result.message;
                statusMessage.className = 'status-message success';
                convertedCount.textContent = result.stats.converted;

                // Update file statuses
                files.forEach((_, index) => {
                    updateFileStatus(index, 'Done', true);
                });

                // Download the file after short delay
                setTimeout(() => {
                    window.location.href = result.download_url;
                    setTimeout(() => {
                        window.location.href = `/thank-you?uploaded=${result.stats.uploaded}&converted=${result.stats.converted}`;
                    }, 1500);
                }, 500);
            } else {
                // Handle conversion errors
                statusMessage.textContent = result.error || 'Conversion failed';
                statusMessage.className = 'status-message error';
                progressFill.style.width = '0%';
                convertBtn.disabled = false;

                // Update file statuses to failed
                files.forEach((_, index) => {
                    updateFileStatus(index, 'Failed', false);
                });
            }
        } catch (err) {
            statusMessage.textContent = 'Network error. Please try again.';
            statusMessage.className = 'status-message error';
            progressFill.style.width = '0%';
            convertBtn.disabled = false;
        }
    });

    // Initialize
    updateFileInputAccept();
});