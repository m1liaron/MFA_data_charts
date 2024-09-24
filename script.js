const dropArea = document.getElementById('drop-area');
const fileInput = document.getElementById('file-input');
const fileList = document.getElementById('file-list');

['dragenter', 'dragover', 'grapleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, preventDefaults, false)
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

['dragenter', 'dragover'].forEach(eventName => {
    dropArea.addEventListener(eventName, () => dropArea.classList.add('active'), false);
});

['dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, () => dropArea.classList.remove('active'), false);
});

dropArea.addEventListener('drop', handleDrop, false);

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFiles(files);
}

dropArea.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', (e) => handleFiles(fileInput.files));

const allowedFileTypes = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/json'];

function isFileTypeAllowed(file) {
    return allowedFileTypes.includes(file.type) || isFileExtensionAllowed(file.name);
}

function isFileExtensionAllowed(fileName) {
    const allowedExtensions = ['csv', 'xls', 'xlsx', 'json'];
    const fileExtension = fileName.split('.').pop().toLowerCase();
    return allowedExtensions.includes(fileExtension);
}

function handleFiles(files) {
    [...files].forEach(file  => {
        if(isFileTypeAllowed(file)){
            displayFile(file);
        } else {
            alert(`File type not allowed: ${file.name}`);
        }
    });
}

function displayFile(file) {
    const fileItem = document.createElement('div');
    fileItem.classList.add('file-item');
    fileItem.textContent  = `${file.name} (${Math.round(file.size / 1024 )})`
    fileList.appendChild(fileItem);
}