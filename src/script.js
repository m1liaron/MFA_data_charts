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

// dropdown charts button

const dropdownButton = document.querySelector('#dropdown-button');
const dropdownMenu = document.querySelector('#dropdown-menu');

dropdownButton.addEventListener('click', () => {
    dropdownMenu.classList.toggle('hide');
});

const data= [10,25,40,30, 45, 60, 70, 100];
const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const maxValue = Math.max(...data);
// line chart

const canvas = document.getElementById('line-chart');
const ctx = canvas.getContext('2d');

const chartWidth = canvas.width - 60;
const chartHeight  = canvas.height - 60;
const padding = 30;

function drawLineChart() {
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, canvas.height - padding);
    ctx.lineTo(canvas.width - padding, canvas.height - padding);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Draw the data point and the connecting lines
    ctx.strokeStyle = '#00afff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    data.forEach((point, i) => {
        const x = padding + (i * (chartWidth / (data.length - 1)));
        const y = canvas.height - padding - (point / maxValue) * chartHeight;

        if(i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }

        ctx.arc(x, y, 4, 0, 2 * Math.PI);
    });
    ctx.stroke();

    // Draw labels on the X-axis
    labels.forEach((label, i) => {
        const x = padding + (i * (chartWidth / ( data.length - 1)));
        const y = canvas.height - padding + 20;

        ctx.fillStyle = '#000';
        ctx.font = '12px Arial';
        ctx.fillText(label, x - 10, y)
    })

    // Draw Y axis values
    const stepSize = maxValue / 5;
    for(let i = 0; i <= 5; i++) {
        const y = canvas.height - padding - (i * (chartHeight / 5));
        const value = (stepSize * i).toFixed(0);

        ctx.fillStyle = '#000';
        ctx.font = '12px Arial';
        ctx.fillText(value, padding - 25, y + 5);
    }
}

// bar chart

const barCanvas = document.getElementById('bar-chart');
const barCtx = barCanvas.getContext('2d');

// Bar chart dimensions
const barChartHeight = barCanvas.height - 60; // Padding for labels
const barPadding = 30;
const barWidth = 40; // Width of each bar

// Function to draw the bar chart
function drawBarChart() {
    // Draw X and Y axis
    barCtx.beginPath();
    barCtx.moveTo(barPadding, barPadding);
    barCtx.lineTo(barPadding, barCanvas.height - barPadding);
    barCtx.lineTo(barCanvas.width - barPadding, barCanvas.height - barPadding);
    barCtx.strokeStyle = '#000';
    barCtx.lineWidth = 2;
    barCtx.stroke();

    // Draw bars
    data.forEach((value, i) => {
        const x = barPadding + i * (barWidth + 20);
        const y = barCanvas.height - barPadding - (value / maxValue) * barChartHeight;

        // Draw each bar
        barCtx.fillStyle = '#00aaff';
        barCtx.fillRect(x, y, barWidth, (value / maxValue) * barChartHeight);

        // Draw labels on the X-axis
        barCtx.fillStyle = '#000';
        barCtx.font = '12px Arial';
        barCtx.fillText(labels[i], x + barWidth / 4, barCanvas.height - barPadding + 20);
    });

    // Draw Y axis values
    const stepSize = maxValue / 5;
    for (let i = 0; i <= 5; i++) {
        const y = barCanvas.height - barPadding - (i * (barChartHeight / 5));
        const value = (stepSize * i).toFixed(0);

        barCtx.fillStyle = '#000';
        barCtx.font = '12px Arial';
        barCtx.fillText(value, barPadding - 25, y + 5);
    }
}

// Pie chart

const pieCanvas = document.getElementById('pie-chart');
const pieCtx = barCanvas.getContext('2d');

const total = data.reduce((sum, value) => sum + value, 0);
const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'];

function drawPieChart() {
    let startAngle = 0;

    data.forEach((value, i) => {
        const sliceAngle = (value / total) * 2 * Math.PI;

        pieCtx.beginPath();
        pieCtx.moveTo(pieCanvas.width / 2, pieCanvas.height / 2);
        pieCtx.arc(
            pieCanvas.width / 2,
            pieCanvas.height / 2,
            pieCanvas.height / 2 - 20,
            startAngle,
            startAngle + sliceAngle
        );
        pieCtx.closePath();

        pieCtx.fillStyle = colors[i];
        pieCtx.fill();

        const textX = pieCanvas.width / 2 + Math.cos(startAngle + sliceAngle / 2) * (pieCanvas.height / 3);
        const textY = pieCanvas.height / 2 + Math.sin(startAngle + sliceAngle / 2) * (pieCanvas.height / 3);
        ctx.fillStyle = '#000';
        ctx.font = '14px Arial';
        ctx.fillText(labels[i], textX - 10, textY);

        // Update startAngle for the next slice
        startAngle += sliceAngle;
    })
}

drawLineChart();
drawBarChart();
drawPieChart();