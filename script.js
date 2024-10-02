window.addEventListener('DOMContentLoaded', () => {
    const dropArea = document.getElementById('drop-area');
    const fileInput = document.getElementById('file-input');
    const jsonOutput = document.getElementById('json-output');
    const chartContainer = document.getElementById('chart__container');
    const fileList = document.getElementById('file-list');
    const dropdownButton = document.getElementById('dropdown-select');
    const generateChartBtn = document.getElementById('generate-chart-btn');
    const graphTitleInput = document.getElementById('graph-title-input');
    const xCaptionContainer = document.getElementById('x-caption-container');
    const yCaptionContainer = document.getElementById('y-caption-container');
    const selectXField = document.getElementById('select-x-field');
    const selectYField = document.getElementById('select-y-field');
    const fieldXModal = document.getElementById('field-x-modal');
    const fieldYModal = document.getElementById('field-y-modal');
    const resetFileBtn = document.getElementById('reset-files-btn');
    const exportBtn = document.getElementById('export-btn');
    const exportSelect = document.getElementById('select-export');

    // State Variables
    let uploadedData;
    let chosenChartType = 'Line';
    let graphTitleValue = '';
    let xFields = new Set();
    let yFields = new Set();
    const fieldColors = {};
    let exportType = 'png'; // png || pdf || svg

    // Error Handling
    const errorCard = document.querySelector('.error-card');
    const messageText = errorCard.querySelector('.message-text');
    const subText = errorCard.querySelector('.sub-text');
    const closeBtn = document.querySelector('#close-btn');

    // Common functions
    function getColor(index) {
        const colors = ['#00afff', '#ff5733', '#33ff57', '#ff33a6', '#33a6ff'];
        return colors[index % colors.length];  // Cycle through colors
    }

    function createElement ({tag, className, id, textContent, width, height, type}) {
        const element = document.createElement(tag);
        if(id) element.id = id;
        if(className) element.className = className
        if(textContent) element.textContent = textContent;
        if (width) element.width = width ;
        if(height) element.height = height;
        if(type) element.type = type;
        return element;
    }

    const showError = (title = '', message = '') => {
        messageText.textContent = title;
        subText.textContent = message;

        // Show the error card with the 'show' class
        errorCard.classList.add('show');
        errorCard.classList.remove('hide');
        errorCard.style.display = 'flex';

        // Auto-hide the error card after 5 seconds
        setTimeout(() => {
            hideError();
        }, 5000);
    };

    const hideError = () => {
        // Add the 'hide' class to start the transition
        errorCard.classList.add('hide');
        errorCard.classList.remove('show');

        // Once the transition ends, set display to 'none'
        errorCard.addEventListener('transitionend', () => {
            errorCard.style.display = 'none';
        }, { once: true }); // Ensures the event listener is triggered only once
    };

    closeBtn.addEventListener('click', hideError);

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles(files);
    }

    function handleFiles(files) {
        [...files].forEach(file  => {
            if(isFileTypeAllowed(file)){
                validateDataFileType(file);
            } else {
                showError('Error type', `Type is not allowed: : ${file.name}`)
            }
        });
    }

    const isFileTypeAllowed = (file) => {
        const allowedFileTypes = [
            'text/csv',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/json'
        ];
        return allowedFileTypes.includes(file.type) || isFileExtensionAllowed(file.name);
    };

    function isFileExtensionAllowed(fileName) {
        const allowedExtensions = ['csv', 'xls', 'xlsx', 'json'];
        const fileExtension = fileName.split('.').pop().toLowerCase();
        return allowedExtensions.includes(fileExtension);
    }

    function addCanvasToChartContainer(canvas) {
        chartContainer.innerHTML = '';
        chartContainer.appendChild(canvas);
    }

    function uploadDisplayData(data, file) {
        uploadedData = data;
        createDataPreviewTable(data);
        jsonOutput.textContent = JSON.stringify(data, null, 2); // Format JSON for readability
        displayFile(file);
    }

    const isNumeric = (value) => !isNaN(parseFloat(value)) && isFinite(value);


    ['dragenter', 'dragover', 'grapleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false)
    });


    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, () => dropArea.classList.add('active'), false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, () => dropArea.classList.remove('active'), false);
    });

    dropArea.addEventListener('drop', handleDrop, false);

    dropArea.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => handleFiles(fileInput.files));

    function validateDataFileType(file) {
        switch (file.type) {
            case 'application/json':
                validateJsonFile(file);
                break;
            case 'text/csv':
                validateCSVFile(file);
                break;
            case 'application/vnd.ms-excel' :
                validateXLSFile(file);
                break;
            case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' :
                validateXLSFile(file);
                break;
            default:
                break;
        }
    }

    function displayFile(file) {
        fileList.innerHTML = '';
        const fileItem = createElement({
            tag:'div',
            className:'file-item',
            textContent: `${file.name} (${Math.round(file.size / 1024 )})`
        });
        fileList.appendChild(fileItem);
    }

    // Functions to validate file

    function validateJsonFile(file) {
        if(file && file.type === "application/json") {
            const reader = new FileReader();

            reader.onload = function(e) {
                try {
                    const jsonData = JSON.parse(e.target.result);
                    uploadDisplayData(jsonData, file);
                } catch(error) {
                    jsonOutput.textContent = "Invalid JSON file";
                    showError('Invalid JSON file', '');
                }
            };

            reader.readAsText(file);
        } else {
            jsonOutput.textContent = "Please upload a valid JSON file";
        }
    }

    function validateCSVFile(file) {
        if(file) {
            const reader = new FileReader();

            reader.onload = function (e) {
                try {
                    const csvArray = csvToArr(e.target.result, ",");
                    uploadDisplayData(csvArray, file);
                } catch (error) {
                    const errorMessage = `Invalid CSV file: ${error}`
                    jsonOutput.textContent = errorMessage;
                    alert(errorMessage);
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

    function validateXLSFile(file) {
        if(file) {
            const reader = new FileReader();

            reader.onload = function (e) {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' })

                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const sheetData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                if(sheetData.length > 0) {
                    const headers = sheetData[0];
                    const jsonData = sheetData.slice(1).map(row => {
                        let obj = {};
                        headers.forEach((header, index) => {
                            obj[header] = row[index];
                        });
                        return obj;
                    });

                    uploadDisplayData(jsonData, file)
                }
            }

            reader.readAsArrayBuffer(file);
        } else {
            showError('File is not exist');
        }
    }

    // Preview data table
    const tablePlaceholder = document.getElementById("table-placeholder");

    function createDataPreviewTable(tableData) {
        tablePlaceholder.innerHTML = '';
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
    if(!uploadedData || !uploadedData.length){
        return showError('Export data to generate chart!');
    }
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

function getFieldColor (field, i) {
    return fieldColors[field] || getColor(i);
}

// line chart
function drawLineChart(propsData) {
    const data = checkDataForDuplicate(propsData);
    let scale = 1;
    let offsetX = 0;
    let offsetY = 0;
    let isDragging = false;
    let dragStartX, dragStartY;

    const containerWidth = window.innerWidth;
    const canvasWidth = Math.max(containerWidth, 600); // Minimum width of 600px for smaller screens
    const canvasHeight = 500; // Keep the height fixed, or you can adjust based on container

    const canvas = createElement({tag: 'canvas', id: 'line-chart', width: canvasWidth, height: canvasHeight});
    const ctx = canvas.getContext('2d');

    // Dynamically calculate chart width, leaving space for the legend
    const legendWidth = 160; // Fixed width for the legend section
    const chartHeight = canvas.height - 60; // Keep height consistent
    const padding = 30;

    const isNumeric = (value) => !isNaN(parseFloat(value)) && isFinite(value);

    const fields = [...yFields];
    const values = [...xFields];

    const maxValue = Math.max(
        ...data.flatMap(d =>
            fields.map(field => {
                const value = d[field];
                return isNumeric(value) ? parseFloat(value) : -Infinity; // Use -Infinity to exclude non-numeric values
            })
        )
    );
    canvas.addEventListener('wheel', function(event) {
       const zoomAmount = event.deltaY * -0.001;
       scale = Math.min(Math.max(0.5, scale + zoomAmount), 5);
       draw();
    });

    canvas.addEventListener('mousedown', function(event) {
        isDragging = true;
        dragStartX = event.offsetX - offsetX;
        dragStartY = event.offsetY - offsetY;
    });

    canvas.addEventListener('mousemove', function(event) {
        if(isDragging) {
            offsetX = event.offsetX - dragStartX;
            offsetY = event.offsetY - dragStartY;
            draw();
        }
    })

    canvas.addEventListener('mouseup', function() {
        isDragging = false;
    });

    canvas.addEventListener('mouseleave', function() {
        isDragging = false;
    })

    function draw() {
        const chartWidth = (canvas.width - legendWidth - 60) * scale;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw graph title

        ctx.fillStyle = '#000';
        ctx.font = '18px Arial';
        const titleWidth = ctx.measureText(graphTitleValue).width; // Calculate the width of the title
        const titleX = (canvas.width - titleWidth) / 2; // Calculate x position to center the title
        ctx.fillText(graphTitleValue, titleX, padding - 10); // Draw the title

        // Draw X and Y axes
        ctx.beginPath();
        ctx.moveTo(padding + offsetX, padding + offsetY);
        ctx.lineTo(padding + offsetX, canvas.height - padding + offsetY);
        ctx.lineTo(chartWidth + padding + offsetX, canvas.height - padding + offsetY);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Draw Y axis values
        const stepSize = maxValue / 5;
        for (let i = 0; i <= 5; i++) {
            const y = canvas.height - padding - (i * (chartHeight / 5)) + offsetY;
            const value = (stepSize * i).toFixed(0);
            ctx.fillStyle = '#000';
            ctx.font = '12px Arial';
            ctx.fillText(value, padding - 30 + offsetX, y + 5);
        }

        // Draw X-axis labels (years)
        values.forEach((year) => {
            data.forEach((item, index) => {
                const value = item[year];

                const x = padding + (index * (chartWidth / (data.length - 1))) + offsetX;
                const y = canvas.height - padding + 20 + offsetY;
                ctx.fillStyle = '#000';
                ctx.font = '12px Arial';
                ctx.fillText(value, x - 15, y);
            })
        });

        // Draw lines for each field
        fields.forEach((field, index) => {
            const color = getFieldColor(field, index)
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.beginPath();

            data.forEach((point, i) => {
                const x = padding + (i * (chartWidth / (data.length - 1))) + offsetX;
                const y = canvas.height - padding - (point[field] / maxValue) * chartHeight + offsetY;
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

        // Draw legend
        const legendX = chartWidth + 80 + offsetX;
        let legendY = 50 + offsetY;
        fields.forEach((field, index) => {
            const color = getFieldColor(field, index)
            ctx.fillStyle = color;
            ctx.fillRect(legendX, legendY, 20, 20);
            ctx.fillStyle = '#000';
            ctx.font = '16px Arial';
            ctx.fillText(field, legendX + 30, legendY + 15);
            legendY += 30;
        });
    }

    draw();
    addCanvasToChartContainer(canvas);
}

// bar chart
function drawBarChart(propsData) {
    const data = checkDataForDuplicate(propsData);
    let scale = 1;
    let offsetX = 0;
    let offsetY = 0;
    let isDragging = false;
    let dragStartX, dragStartY;

    const keys = [...yFields];
    const labels = new Set(); // Use Set for unique labels

    // Collect unique labels
    xFields.forEach((field) => {
        data.forEach((item) => {
            const value = item[field];
            labels.add(value);
        });
    });

    const uniqueLabels = Array.from(labels); // Convert Set back to array
    const dataSeries = keys.map(key => data.map(item => item[key]));
    const maxValue = Math.max(
        ...data.flatMap(d =>
            keys.map(field => {
                const value = d[field];
                return isNumeric(value) ? parseFloat(value) : -Infinity; // Use -Infinity to exclude non-numeric values
            })
        )
    );

    // Create canvas
    const barCanvas = createElement({ tag: 'canvas', id: 'bar-chart' });
    const barCtx = barCanvas.getContext('2d');

    barCanvas.addEventListener('wheel', function(event) {
        const zoomAmount = event.deltaY * -0.001;
        scale = Math.min(Math.max(0.5, scale + zoomAmount), 5);
        draw();
    });

    // Add mouse events for dragging
    barCanvas.addEventListener('mousedown', function(event) {
        isDragging = true;
        dragStartX = event.offsetX - offsetX;
        dragStartY = event.offsetY - offsetY;
    });

    barCanvas.addEventListener('mousemove', function(event) {
        if(isDragging) {
            offsetX = event.offsetX - dragStartX;
            offsetY = event.offsetY - dragStartY;
            draw();
        }
    });

    barCanvas.addEventListener('mouseup', function() {
        isDragging = false;
    });

    barCanvas.addEventListener('mouseleave', function() {
        isDragging = false;
    });

    barCanvas.width = 900;
    barCanvas.height = 400;

    function draw() {
        const barChartHeight = barCanvas.height - 60; // Padding for labels
        const barPadding = 50;
        const baseBarWidth = 40; // Base width of each bar group (without scaling)
        const barWidth = baseBarWidth * scale; // Scale the bar width

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

        // Draw bars
        uniqueLabels.forEach((label, i) => {
            keys.forEach((key, j) => {
                const value = dataSeries[j][i];
                const x = barPadding + (i * (barWidth + 10)) + j * (barWidth / keys.length);
                const y = barCanvas.height - barPadding - (value / maxValue) * barChartHeight;

                barCtx.fillStyle = getFieldColor(key,  j)
                barCtx.fillRect(x, y, barWidth / keys.length, (value / maxValue) * barChartHeight);
            });

            barCtx.fillStyle = '#000';
            barCtx.font = '12px Arial';
            const labelX = barPadding + i * (barWidth + 10);
            barCtx.fillText(label, labelX + (barWidth / 4), barCanvas.height - barPadding + 20);
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
            barCtx.fillStyle = getFieldColor(key,  index)
            barCtx.fillRect(legendX, legendY, 15, 15);

            // Series name
            barCtx.fillStyle = '#000';
            barCtx.font = '12px Arial';
            barCtx.fillText(key, legendX + 20, legendY + 12);
        });
    }

    draw();
    addCanvasToChartContainer(barCanvas);
}

// Pie chart
function drawPieChart(propsData){
    const data = checkDataForDuplicate(propsData);
        const pieCanvas = createElement({
            tag: 'canvas',
            id: 'pie-chart',
            width: window.innerWidth - 100,
            height: window.innerHeight - 450
        });

        const pieCtx = pieCanvas.getContext('2d');

        let keyId = 0;

        function updateChart() {
            pieCtx.clearRect(0, 0, pieCanvas.width, pieCanvas.height);

            const keys = [...yFields];
            const total = keys.reduce((sum, key) => sum + data[keyId][key], 0);

            const radius = pieCanvas.height / 2 - 20
            let startAngle = 0;
            keys.forEach((key, i) => {
                const value = data[keyId][key];
                const sliceAngle = (value / total) * 2 * Math.PI;
                const color = getFieldColor(key, i);

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
            const xKey = [...xFields]
            pieCtx.fillText(`Year: ${data[keyId][xKey]}`, pieCanvas.width / 3.5 - 50, 22);
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

    function checkDataForDuplicate(data) {
        const result = {};

        data.forEach(item => {
            // Ensure Year is defined and convert to string, else skip this item or handle accordingly
            const yearValue = item.Year ? String(item.Year).toLowerCase() : null;

            // If no valid Year, skip this entry
            if (!yearValue) return;

            const { Year, ...values } = item;

            if (result[yearValue]) {
                // If the year is already present, sum the numeric values
                Object.keys(values).forEach(key => {
                    if (typeof values[key] === 'number') {
                        result[yearValue][key] += values[key];
                    }
                });
            } else {
                // Otherwise, initialize the year entry
                result[yearValue] = { ...values };
            }
        });

        // Convert the result back to an array, restoring the Year field as a number
        return Object.entries(result).map(([year, values]) => ({
            Year: parseInt(year, 10), // Parse year as a number
            ...values
        }));
    }


    // Customization panel functions ✒️

    graphTitleInput.addEventListener('change', (e) => {
        graphTitleValue = e.target.value;
    });

    selectXField.addEventListener('click', showXFieldModal);
    selectYField.addEventListener('click', showYFieldModal);

    let xFieldModalContent = null;
    let yFieldModalContent = null;

    function showXFieldModal() {
        if (uploadedData && uploadedData.length > 0) {
            if(!fieldYModal.classList.contains('hide')){
                fieldYModal.classList.toggle('hide');
            }

            if (!xFieldModalContent) {
                const fields = uploadedData[0];
                xFieldModalContent = createFieldModal(fields, 'x');
                fieldXModal.appendChild(xFieldModalContent);
            }
                fieldXModal.classList.toggle('hide');
        }
    }

    function showYFieldModal() {
        if (uploadedData && uploadedData.length > 0) {
            if(!fieldXModal.classList.contains('hide')){
                fieldXModal.classList.toggle('hide');
            }

            if (!yFieldModalContent) {
                yFieldModalContent = createFieldModal(uploadedData[0], 'y');
                fieldYModal.appendChild(yFieldModalContent);
            }
            fieldYModal.classList.toggle('hide');
        }
    }

    function createFieldModal(fields, axis) {
        const fieldsContainer = createElement({ tag: 'div', className: 'fields__axis__container' });
        for(let key in fields) {
            const fieldContainer = createElement({ tag: 'div', className: 'field__axis__container' });
            const fieldElement = createElement({tag: 'span', className: 'field__axis', textContent: `${key}:${fields[key]}`});

            fieldContainer.addEventListener('click', () => {
                addField(key, axis);
            });

            fieldContainer.appendChild(fieldElement);
            fieldsContainer.appendChild(fieldContainer);
        }
        return fieldsContainer
    }

    function addField(fieldKey, axis) {
        if (xFields.has(fieldKey) || yFields.has(fieldKey)) {
            return showError('You already added this field');
        }
        if ([...xFields].length > 1) {
            return;
        }

        const fieldItem = createElement({ tag: 'div', className: 'field__axis__container' });
        const fieldItemText = createElement({ tag: 'p', textContent: fieldKey });
        const removeFieldIcon = createElement({ tag: 'span', className: 'material-symbols-outlined remove_field_icon', textContent: 'close' });

        // Only create a color input for Y-axis
        let colorInput;
        if (axis === 'y') {
            colorInput = createElement({ tag: 'input', type: 'color' });

            if (fieldColors[fieldKey]) {
                colorInput.value = fieldColors[fieldKey];
            } else {
                let index = 0;
                const color = getColor(index);
                colorInput.value = color
                fieldColors[fieldKey] = color;
                index += 1
            }

            // Save the selected color when it changes
            colorInput.addEventListener('input', (e) => {
                fieldColors[fieldKey] = e.target.value; // Save color for the field
            });

            fieldItem.appendChild(colorInput); // Append the color input only for Y-axis
        }

        removeFieldIcon.addEventListener('click', () => {
            if (axis === 'x') {
                xFields.delete(fieldKey);
            } else {
                yFields.delete(fieldKey);
                delete fieldColors[fieldKey]; // Clean up color data when field is removed
            }

            fieldItem.remove();
        });

        fieldItem.appendChild(fieldItemText);
        fieldItem.appendChild(removeFieldIcon);

        if (axis === 'x') {
            xFields.add(fieldKey);
            xCaptionContainer.appendChild(fieldItem);
        } else {
            yFields.add(fieldKey);
            yCaptionContainer.appendChild(fieldItem);
        }
    }

    resetFileBtn.addEventListener('click', () => {
        tablePlaceholder.innerHTML = '';
        uploadedData = [];
        xFields.clear();
        yFields.clear();
        fieldXModal.classList.add('hide');
        fieldYModal.classList.add('hide');
        chartContainer.innerHTML = '';
        jsonOutput.textContent = '';
        fileList.innerHTML = '';
    });

    // Export functions

    exportSelect.addEventListener('change', (e) => {
        exportType = e.target.value;
    });

    exportBtn.addEventListener('click', () => {
        const canvas = document.querySelector(`#${chosenChartType.toLowerCase()}-chart`);

        if(canvas) {
            if(exportType === 'png') {
                const image = canvas.toDataURL('image/png', 1.0);

                const link = document.createElement('a');
                link.href = image;
                link.download = 'graph.png';
                link.click();
            } else if (exportType === 'svg') {
                const width = canvas.width;
                const height = canvas.height;

                let svgContent = `
                  <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" version="1.1">
                    <rect width="${width}" height="${height}" fill="white"></rect>
                    <image x="0" y="0" width="${width}" height="${height}" href="${canvas.toDataURL('image/png')}" />
                </svg>`;

                const svgBlob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8'});
                const svgUrl = URL.createObjectURL(svgBlob);

                const link = document.createElement('a');
                link.href = svgUrl;
                link.download = 'graph.svg';
                link.click();
            } else if(exportType === 'pdf') {
                const printWindow = window.open('', '_blank');

                if (printWindow) {
                    const image = canvas.toDataURL('image/png');
                    printWindow.document.write(`
                    <html>
                        <head>
                            <title>{graphTitleValue}</title>
                        </head>
                        <body>
                            <img src="${image}" style="width: 100%; height: auto;" />
                        </body>
                    </html>
                `);
                    printWindow.document.close(); // Close the document to finish loading
                    printWindow.print(); // Trigger the print dialog
                    // printWindow.close(); // Optionally close the print window after printing
                }
            }
        } else {
            showError('No chart to export')
        }
    });

    window.addEventListener('keydown', (e) => {
        // Check if the Control key and the P key are pressed together
        if (e.ctrlKey && e.code === 'KeyP') {
            e.preventDefault(); // Prevent the default print behavior

            const canvas = document.querySelector(`#${chosenChartType.toLowerCase()}-chart`);

            if (canvas) {
                const printWindow = window.open('', '_blank');

                if (printWindow) {
                    const image = canvas.toDataURL('image/png');
                    printWindow.document.write(`
                    <html>
                        <head>
                            <title>{graphTitleValue}</title>
                        </head>
                        <body>
                            <img src="${image}" style="width: 100%; height: auto;" />
                        </body>
                    </html>
                `);
                    printWindow.document.close(); // Close the document to finish loading
                    printWindow.print(); // Trigger the print dialog
                }
            } else {
                showError('No chart to export');
            }
        }
    });

});