window.addEventListener('DOMContentLoaded', () => {
    const dropArea = document.getElementById('drop-area');
    const fileInput = document.getElementById('file-input');
    const jsonOutput = document.getElementById('json-output');
    const chartContainer = document.getElementById('chart__container');
    const uploadedDataContainer = document.getElementById('uploaded-data-container');
    // Generation chart elements
    const dropdownButton = document.getElementById('dropdown-select');
    const generateChartBtn = document.getElementById('generate-chart-btn');

    let uploadedData;
    let chosenChartType = 'Line';

    // Common functions

    function getColor(index) {
        const colors = ['#00afff', '#ff5733', '#33ff57', '#ff33a6', '#33a6ff'];
        return colors[index % colors.length];  // Cycle through colors
    }

    function addCanvasToChartContainer(canvas) {
        chartContainer.innerHTML = '';
        chartContainer.appendChild(canvas);
    }

    function createElement ({tag, className, id, textContent, width, height }) {
        const element = document.createElement(tag);
        if(id) element.id = id;
        if(className) element.className = className
        if(textContent) element.textContent = textContent;
        if (width) element.width = width ;
        if(height) element.height = height;
        return element;
    }

    // Drag & drop functionality

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
                validateDataFileType(file, files);
            } else {
                alert(`File type not allowed: ${file.name}`);
            }
        });
    }

    function validateDataFileType(file, files) {
        switch (file.type) {
            case 'application/json':
                validateJsonFile(files);
                break;
            case 'text/csv':
                validateCSVFile(files);
                break;
            default:
                break;
        }
    }

    function displayFile(file) {
        const fileItem = createElement({
            tag:'div',
            className:'file-item',
            textContent: `${file.name} (${Math.round(file.size / 1024 )})`
        });
        uploadedDataContainer.insertAdjacentElement('afterend', fileItem);
    }

    // Functions to validate file

    function validateJsonFile(files) {
        const file = files[0];

        if(file && file.type === "application/json") {
            const reader = new FileReader();

            reader.onload = function(e) {
                try {
                    const jsonData = JSON.parse(e.target.result);
                    jsonOutput.textContent = JSON.stringify(jsonData, null, 2);
                    uploadedData = jsonData;
                    createDataPreviewTable(jsonData);
                    displayFile(file);
                } catch(error) {
                    console.log(error);
                    
                    jsonOutput.textContent = "Invalid JSON file";
                    alert('Invalid JSON file');
                }
            };

            reader.readAsText(file);
        } else {
            jsonOutput.textContent = "Please upload a valid JSON file";
        }
    }

    function validateCSVFile(files) {
        const file = files[0];

        if(file) {
            const reader = new FileReader();

            reader.onload = function (e) {
                try {
                    const csvArray = csvToArr(e.target.result, ",");
                    jsonOutput.textContent = JSON.stringify(csvArray, null, 4);
                    uploadedData = csvArray;
                    createDataPreviewTable(csvArray);
                    displayFile(file);
                } catch (error) {
                    console.log(error);

                    jsonOutput.textContent = "Invalid CSV file";
                    alert('Invalid CSV file');
                }
            }
            reader.readAsText(file);
        }
    }

    function csvToArr(stringVal, splitter) {
        const [keys, ...rest] = stringVal
            .trim()
            .split("\n")
            .map((item) => item.split(splitter));

        const formedArr = rest.map((item) => {
            const object = {};
            keys.forEach((key, index) => (object[key] = item.at(index)));
            return object;
        });
        return formedArr;
    }

    // Preview data table
    const tablePlaceholder = document.getElementById("table-placeholder");

    function createDataPreviewTable(tableData) {
        const tableDiv= createElement({ tag:"table", id: "table" });
        tablePlaceholder.appendChild(tableDiv);

        createRow(tableData);
        createColumn(tableData);
    }

    function createColumn(tableData) {
        const columnContainer = createElement({ tag: 'tbody' });
        const tr = createElement({ tag: 'tr'});
        const table = document.getElementById('table');

        tableData.forEach((rowData, rowIndex) => {
            const tr = createElement({ tag: 'tr' });
            const th = createElement({ tag: 'th', textContent: rowIndex + 1 });
            tr.appendChild(th);
            
            Object.values(rowData).forEach((value) => {
                const td = createElement({ tag: 'td', textContent: value });
                tr.appendChild(td);
            })

            columnContainer.appendChild(tr);
        });
        
        columnContainer.appendChild(tr);
        table.appendChild(columnContainer);
    }

    function createRow(tableData) {
        const dataKeys = Object.keys(tableData[0]);
        const rowContainer = createElement({ tag: "thead" });
        const tr = createElement({ tag: "tr" });
        const previewDataContainer = document.getElementById('table');

        const th = createElement({ tag: 'th', textContent: '' });
        tr.appendChild(th);

        dataKeys.forEach((item) => {
            const th = createElement({ tag: 'th', textContent: item });
            tr.appendChild(th);
        });
        rowContainer.appendChild(tr);
        previewDataContainer.appendChild(rowContainer);
    }

// ! CHARTS
// Generation chart

dropdownButton.addEventListener('change', (e) => {
    chosenChartType = e.target.value;
});

generateChartBtn.addEventListener('click', () => drawChosenChart(chosenChartType));

function drawChosenChart(chartType) {
    switch (chartType) {
        case 'Line':
            drawLineChart(uploadedData);
            break;
        case 'Bar':
            drawBarChart(uploadedData);
            break;
        case 'Pie':
            drawPieChart(uploadedData);
            break;
        default:
            break;
    }
}

// Generate chart

// line chart
function drawLineChart(data) {
        const containerWidth = window.innerWidth * 0.8; // Use 80% of the window width (or parent container width)
        const canvasWidth = Math.max(containerWidth, 600); // Minimum width of 600px for smaller screens
        const canvasHeight = 500; // Keep the height fixed, or you can adjust based on container

        const canvas = createElement({ tag: 'canvas', id: 'line-chart', width: canvasWidth, height: canvasHeight });

        const ctx = canvas.getContext('2d');

        // Dynamically calculate chart width, leaving space for the legend
        const legendWidth = 160; // Fixed width for the legend section
        const chartWidth = canvas.width - legendWidth - 60; // Chart width based on canvas size
        const chartHeight = canvas.height - 60; // Keep height consistent
        const padding = 30;

        const fields = Object.keys(data[0]).filter(item => item !== 'Year');
        const maxValue = Math.max(...data.flatMap(d => fields.map(field => d[field])));

        // Draw X and Y axis
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, canvas.height - padding);
        ctx.lineTo(chartWidth + padding, canvas.height - padding); // Adapt chart width
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Draw Y axis values
        const stepSize = maxValue / 5;
        for (let i = 0; i <= 5; i++) {
            const y = canvas.height - padding - (i * (chartHeight / 5));
            const value = (stepSize * i).toFixed(0);

            ctx.fillStyle = '#000';
            ctx.font = '12px Arial';
            ctx.fillText(value, padding - 30, y + 5);
        }

        // Draw X-axis labels (years)
        const years = data.map(d => d.Year);
        years.forEach((year, i) => {
            const x = padding + (i * (chartWidth / (data.length - 1))); // Adjust based on dynamic width
            const y = canvas.height - padding + 20;

            ctx.fillStyle = '#000';
            ctx.font = '12px Arial';
            ctx.fillText(year, x - 15, y);
        });

        // Draw lines for each field
        fields.forEach((field, index) => {
            const color = getColor(index);
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.beginPath();

            data.forEach((point, i) => {
                const x = padding + (i * (chartWidth / (data.length - 1)));
                const y = canvas.height - padding - (point[field] / maxValue) * chartHeight;

                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }

                // Draw small circles for data points
                ctx.arc(x, y, 4, 0, 2 * Math.PI);
            });
            ctx.stroke();
        });

        // Draw fields (legend) on the right side of the canvas
        const legendX = chartWidth + 80;  // Shift legend to the right
        let legendY = 50;

        fields.forEach((field, index) => {
            const color = getColor(index);

            // Draw the colored box
            ctx.fillStyle = color;
            ctx.fillRect(legendX, legendY, 20, 20);

            // Draw the field name next to the box
            ctx.fillStyle = '#000';
            ctx.font = '16px Arial';
            ctx.fillText(field, legendX + 30, legendY + 15);

            legendY += 30;  // Move down for the next field
        });

        addCanvasToChartContainer(canvas);
}

// bar chart
function drawBarChart(data) {
    // Get all keys (excluding 'Year') for the data series
    const keys = Object.keys(data[0]).filter(key => key !== 'Year')
    const labels = data.map(item => item.Year);

    const dataSeries = keys.map(key => data.map(item => item[key]));
    const maxValue = Math.max(...dataSeries.flat());

    // Create canvas
    const barCanvas = createElement({ tag:'canvas', id: 'bar-chart' });
    barCanvas.id = 'bar-chart';
    const barCtx = barCanvas.getContext('2d');

    barCanvas.width = 900;
    barCanvas.height = 400;

    // Bar chart dimensions
    const barChartHeight = barCanvas.height - 60; // Padding for labels
    const barPadding = 50;
    const barWidth = 40; // Width of each bar group (multiple series per year)
    const seriedPadding = 10;

    // Clear the canvas
    barCtx.clearRect(0, 0, barCanvas.width, barCanvas.height);

    // Draw X and Y axis
    barCtx.beginPath();
    barCtx.moveTo(barPadding, barPadding);
    barCtx.lineTo(barPadding, barCanvas.height - barPadding);
    barCtx.lineTo(barCanvas.width - barPadding, barCanvas.height - barPadding);
    barCtx.strokeStyle = '#000';
    barCtx.lineWidth = 2;
    barCtx.stroke();

    // Color array for multiple series
    labels.forEach((label, i) => {
        keys.forEach((key, j) => {
            const value = dataSeries[j][i];
            const x = barPadding + i * (barWidth + 40) + j * (barWidth / keys.length + seriedPadding);
            const y = barCanvas.height - barPadding - (value / maxValue) * barChartHeight
        
        
            barCtx.fillStyle = getColor(j);
            barCtx.fillRect(x, y, barWidth / keys.length, (value / maxValue) * barChartHeight);
        });

        barCtx.fillStyle = '#000';
        barCtx.font = '12px Arial';
        const labelX = barPadding + i * ( barWidth + 40);
        barCtx.fillText(label, labelX + barWidth / 4, barCanvas.height - barPadding + 20);
    });

    // Draw Y axis values (scaling on Y-axis)
    const stepSize = maxValue / 5;
    for (let i = 0; i <= 5; i++) {
        const y = barCanvas.height - barPadding - (i * (barChartHeight / 5));
        const value = (stepSize * i).toFixed(0);

        barCtx.fillStyle = '#000';
        barCtx.font = '12px Arial';
        barCtx.fillText(value, barPadding - 40, y + 5);
    }

    // Add a legend
    keys.forEach((key, index) => {
        const legendX = barCanvas.width - barPadding + 10;
        const legendY = barPadding + index * 20;

        // Color square for the legend
        barCtx.fillStyle = getColor(index);
        barCtx.fillRect(legendX, legendY, 15, 15);

        // Series name
        barCtx.fillStyle = '#000';
        barCtx.font = '12px Arial';
        barCtx.fillText(key, legendX + 20, legendY + 12);
    });
    addCanvasToChartContainer(barCanvas);
}

// Pie chart
function drawPieChart(data) {
        const pieCanvas = createElement({
            tag: 'canvas',
            id: 'pie-chart',
            width: window.innerWidth - 100,
            height: window.innerHeight - 450
        });

        const pieCtx = pieCanvas.getContext('2d');

        let keyId = 0;

        const buttonX = pieCanvas.width - 200;
        const buttonY = 50;
        const buttonWidth = 150;
        const buttonHeight = 40;

        function isButtonClicked(x, y) {
            return x >= buttonX && x <= buttonX + buttonWidth &&
                   y >= buttonY && y <= buttonY + buttonHeight;
        }

        function updateChart() {
            pieCtx.clearRect(0, 0, pieCanvas.width, pieCanvas.height);

            const keys = Object.keys(data[keyId]).filter(key => key !== 'Year');
            const total = keys.reduce((sum, key) => sum + data[keyId][key], 0);

            const radius = pieCanvas.height / 2 - 20
            let startAngle = 0;
            keys.forEach((key, i) => {
                const value = data[keyId][key];
                const sliceAngle = (value / total) * 2 * Math.PI;
                const color = getColor(i);

                pieCtx.beginPath();
                pieCtx.moveTo(pieCanvas.width / 2, pieCanvas.height / 2);
                pieCtx.arc(
                    pieCanvas.width / 2,
                    pieCanvas.height / 2,
                    radius,
                    startAngle,
                    startAngle + sliceAngle
                );
                pieCtx.closePath();

                pieCtx.fillStyle = color;
                pieCtx.fill();

                const textX = pieCanvas.width / 2 + Math.cos(startAngle + sliceAngle / 2) * (radius / 1.5);
                const textY = pieCanvas.height / 2 + Math.sin(startAngle + sliceAngle / 2) * (radius / 1.5);
                const percentage = ((value / total) * 100).toFixed(1) + '%';

                pieCtx.fillStyle = '#000';
                pieCtx.font = '20px Arial';
                pieCtx.fillText(percentage, textX, textY);

                // Update startAngle for the next slice
                startAngle += sliceAngle;


                // Draw a legends
                const legendX = pieCanvas.width - 500;
                const legendY = 30 + i * 30;

                pieCtx.fillStyle = color;
                pieCtx.font = '20px Arial';
                pieCtx.fillText(key, legendX + 20, legendY + 12);
            });

            // Draw a Year
            pieCtx.fillStyle = '#000';
            pieCtx.font = '30px Arial';
            pieCtx.fillText(`Year: ${data[keyId]['Year']}`, pieCanvas.width / 3.5 - 50, 22);
        }

        const nextYearButton = createElement({ tag:'button', textContent: 'Next year', className: 'button-primary' });

        nextYearButton.addEventListener('click', () => {
            keyId = (keyId + 1) % data.length;
            updateChart();
        });
        updateChart();

       addCanvasToChartContainer(pieCanvas);
        chartContainer.appendChild(nextYearButton);
    }

    // Export functions

    const exportBtn = document.getElementById('export-btn');
    exportBtn.addEventListener('click', () => {
        const canvas = document.querySelector(`#${chosenChartType.toLowerCase()}-chart`);

        if(canvas) {
            const image = canvas.toDataURL('image/png', 1.0);

            const link = document.createElement('a');
            link.href = image;
            link.download = 'graph.png';
            link.click();
        } else {
            alert('No chart found to export');
        }
    });
});