window.addEventListener('DOMContentLoaded', () => {
    const dropArea = document.getElementById('drop-area');
    const fileInput = document.getElementById('file-input');
    const fileList = document.getElementById('file-list');
    const jsonOutput = document.getElementById('json-output');
    const chartContainer = document.getElementById('chart__container');

    const uploadedData = [];

    const addData = (data) => uploadedData.push(data);
    const getData = () => uploadedData;

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
                getJsonFileData(files)
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


    function getJsonFileData(files) {
        const file = files[0];

        if(file && file.type === "application/json") {
            const reader = new FileReader();

            reader.onload = function(e) {
                try {
                    const jsonData = JSON.parse(e.target.result);
                    jsonOutput.textContent = JSON.stringify(jsonData, null, 2);
                    addData(jsonData);
                    createDataPreviewTable(jsonData);
                    drawLineChart(jsonData);
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

    // Preview data table

    const tablePlaceholder = document.getElementById("table-placeholder");

    function createDataPreviewTable(tableData) {
        const tableDiv = document.createElement("table");
        tableDiv.id = "table";
        tablePlaceholder.appendChild(tableDiv);

        createRow(tableData);
        createCollumn(tableData);
    }

    function createCollumn(tableData) {
        const columnContainer = document.createElement("tbody");
        const tr = document.createElement("tr");
        const table = document.getElementById('table');
        const tableDataValues = Object.values(tableData);

        tableData.forEach((rowData, rowIndex) => {
            const tr = document.createElement("tr");
            const th = document.createElement('th');
            th.textContent = rowIndex + 1;
            tr.appendChild(th);
            
            Object.values(rowData).forEach((value) => {
                const td = document.createElement('td');
                td.textContent = value;
                tr.appendChild(td);
            })

            columnContainer.appendChild(tr);
        });
        
        columnContainer.appendChild(tr);
        table.appendChild(columnContainer);
    }

    function createRow(tableData) {
        const dataKeys = Object.keys(tableData[0]);
        const rowContainer = document.createElement("thead");
        const tr = document.createElement("tr");
        const previewDataContainer = document.getElementById('table');

        const th = document.createElement('th');
        th.textContent = ' ';
        tr.appendChild(th);

        dataKeys.forEach((item) => {
            const th = document.createElement('th');
            th.textContent = item;
            tr.appendChild(th);
        });
        rowContainer.appendChild(tr);
        previewDataContainer.appendChild(rowContainer);
    }

// ! CHARTS
// dropdown charts button

    const dropdownButton = document.querySelector('#dropdown-button');
    const dropdownMenu = document.querySelector('#dropdown-menu');

    dropdownButton.addEventListener('click', () => {
        dropdownMenu.classList.toggle('hide');
    });

// line chart

    function drawLineChart(data) {
        const div = document.createElement('div');
        div.className = 'flex';
        const canvas = document.createElement('canvas');
        canvas.id = 'line-chart';
        canvas.width = 600;
        canvas.height = 400;
        const ctx = canvas.getContext('2d');
        const chartWidth = canvas.width - 60;
        const chartHeight  = canvas.height - 60;
        const padding = 30;

        const fields = Object.keys(data[0]).filter(item => item !== 'Year');
        const maxValue = Math.max(...data.flatMap(d => fields.map(field => d[field])));

        // Draw X and Y axis
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, canvas.height - padding);
        ctx.lineTo(canvas.width - padding, canvas.height - padding);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Draw Y axis values
        const stepSize = maxValue / 5;
        for(let i = 0; i <= 5; i++) {
            const y = canvas.height - padding - (i * (chartHeight / 5));
            const value = (stepSize * i).toFixed(0);

            ctx.fillStyle = '#000';
            ctx.font = '12px Arial';
            ctx.fillText(value, padding - 30, y + 5);
        }

        // Draw X-axis labels (years)
        const years = data.map(d => d.Year);
        years.forEach((year, i) => {
            const x = padding + (i * (chartWidth / (data.length - 1)));
            const y = canvas.height - padding + 20;

            ctx.fillStyle = '#000';
            ctx.font = '12px Arial';
            ctx.fillText(year, x - 15, y);
        });

        // Draw lines for each field
        const fieldsContainer = document.createElement('div');
        fieldsContainer.className = 'fields__list__container'
        fields.forEach((field, index) => {
            const color = getColor(index)
            ctx.strokeStyle = color;  // Get different color for each line
            ctx.lineWidth = 2;
            ctx.beginPath();

            data.forEach((point, i) => {
                const x = padding + (i * (chartWidth / (data.length - 1)));
                const y = canvas.height - padding - (point[field] / maxValue) * chartHeight;

                if(i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }

                // Draw small circles for data points
                ctx.arc(x, y, 4, 0, 2 * Math.PI);
            });
            ctx.stroke();

            div.appendChild(canvas)
            const fieldContainer = document.createElement('div');
            fieldContainer.className = 'field__Container';
            const fieldDiv = document.createElement('div');
            fieldDiv.style.background = color;
            fieldDiv.className = 'field__div';
            const filedSpan = document.createElement('span');
            filedSpan.textContent = field;

            fieldContainer.appendChild(fieldDiv);
            fieldContainer.appendChild(filedSpan);

            fieldsContainer.appendChild(fieldContainer);
            div.appendChild(fieldsContainer);
        });
        chartContainer.appendChild(div);
    }

    function getColor(index) {
        const colors = ['#00afff', '#ff5733', '#33ff57', '#ff33a6', '#33a6ff'];
        return colors[index % colors.length];  // Cycle through colors
    }

    const exportBtn = document.getElementById('export-btn');

    exportBtn.addEventListener('click', () => {
       const canvas = document.querySelector('#line-chart');

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


// // bar chart
//
//     const barCanvas = document.getElementById('bar-chart');
//     const barCtx = barCanvas.getContext('2d');
//
// // Bar chart dimensions
//     const barChartHeight = barCanvas.height - 60; // Padding for labels
//     const barPadding = 30;
//     const barWidth = 40; // Width of each bar
//
// // Function to draw the bar chart
//     function drawBarChart() {
//         // Draw X and Y axis
//         barCtx.beginPath();
//         barCtx.moveTo(barPadding, barPadding);
//         barCtx.lineTo(barPadding, barCanvas.height - barPadding);
//         barCtx.lineTo(barCanvas.width - barPadding, barCanvas.height - barPadding);
//         barCtx.strokeStyle = '#000';
//         barCtx.lineWidth = 2;
//         barCtx.stroke();
//
//         // Draw bars
//         data.forEach((value, i) => {
//             const x = barPadding + i * (barWidth + 20);
//             const y = barCanvas.height - barPadding - (value / maxValue) * barChartHeight;
//
//             // Draw each bar
//             barCtx.fillStyle = '#00aaff';
//             barCtx.fillRect(x, y, barWidth, (value / maxValue) * barChartHeight);
//
//             // Draw labels on the X-axis
//             barCtx.fillStyle = '#000';
//             barCtx.font = '12px Arial';
//             barCtx.fillText(labels[i], x + barWidth / 4, barCanvas.height - barPadding + 20);
//         });
//
//         // Draw Y axis values
//         const stepSize = maxValue / 5;
//         for (let i = 0; i <= 5; i++) {
//             const y = barCanvas.height - barPadding - (i * (barChartHeight / 5));
//             const value = (stepSize * i).toFixed(0);
//
//             barCtx.fillStyle = '#000';
//             barCtx.font = '12px Arial';
//             barCtx.fillText(value, barPadding - 25, y + 5);
//         }
//     }
//
// // Pie chart
//
//     const pieCanvas = document.getElementById('pie-chart');
//     const pieCtx = pieCanvas.getContext('2d');
//
//     const total = data.reduce((sum, value) => sum + value, 0);
//     const colors = ['#FF6633', '#FFB399', '#FF33FF', '#FFFF99', '#00B3E6', '#E6B333', '#3366E6', '#B34D4D']; // 8 unique colors
//
//     function drawPieChart() {
//         let startAngle = 0;
//         data.forEach((value, i) => {
//             const sliceAngle = (value / total) * 2 * Math.PI;
//
//             pieCtx.beginPath();
//             pieCtx.moveTo(pieCanvas.width / 2, pieCanvas.height / 2);
//             pieCtx.arc(
//                 pieCanvas.width / 2,
//                 pieCanvas.height / 2,
//                 pieCanvas.height / 2 - 20,
//                 startAngle,
//                 startAngle + sliceAngle
//             );
//             pieCtx.closePath();
//
//             pieCtx.fillStyle = colors[i];
//             pieCtx.fill();
//
//             const textX = pieCanvas.width / 2 + Math.cos(startAngle + sliceAngle / 2) * (pieCanvas.height / 3);
//             const textY = pieCanvas.height / 2 + Math.sin(startAngle + sliceAngle / 2) * (pieCanvas.height / 3);
//
//             const percentage = ((value / total) * 100).toFixed(1) + '%';
//
//             pieCtx.fillStyle = '#cacaca';
//             pieCtx.font = '14px Arial';
//             pieCtx.fillText(percentage, textX - 10, textY);
//
//             // Update startAngle for the next slice
//             startAngle += sliceAngle;
//         })
//     }
//
//     function createPirLegend() {
//         const legend = document.getElementById('legend');
//         labels.forEach((label, i) => {
//             const div = document.createElement('div');
//             const colorBox = document.createElement('span');
//             colorBox.style.backgroundColor = colors[i];
//
//             const labelText = document.createTextNode(label + ' ('  + data[i] +  '°)');
//             div.appendChild(colorBox);
//             div.appendChild(labelText);
//             legend.appendChild(div);
//         })
//     }

    // drawBarChart();
    // drawPieChart();
    // createPirLegend();
});