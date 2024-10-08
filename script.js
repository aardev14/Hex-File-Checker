document.getElementById('compareBtn').addEventListener('click', function () {
    const hexFile = document.getElementById('hexFile').files[0];
    const txtFile = document.getElementById('txtFile').files[0];

    if (!hexFile || !txtFile) {
        alert('Please upload both files.');
        return;
    }

    // Show the loading spinner
    toggleSpinner(true);

    // Read both files and compare
    Promise.all([readFile(hexFile), readFile(txtFile)])
        .then(([hexData, txtData]) => {
            const cleanedHexData = cleanData(hexData);
            const cleanedTxtData = txtData; //cleanData(txtData);

            const processedHexData = processHexFile(cleanedHexData);
            const processedTxtData = processTxtFile(cleanedTxtData);

            const comparison = compareFiles(processedHexData, processedTxtData);
            displayResults(comparison, processedHexData, processedTxtData);
        })
        .catch(err => console.error(err))
        .finally(() => {
            // Hide the loading spinner after processing
            toggleSpinner(false);
        });
});

function toggleSpinner(show) {
    const spinner = document.getElementById('loadingSpinner');
    spinner.style.display = show ? 'block' : 'none';
}

function readFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => resolve(event.target.result.split('\n'));
        reader.onerror = reject;
        reader.readAsText(file);
    });
}

// Function to clean non-printable characters from data
function cleanData(lines) {
    return lines.map(line => line.replace(/[^\x20-\x7E]/g, ''));  // Remove non-printable characters
}

function processHexFile(hexLines) {
    return hexLines
        .filter(line => line.length >= 43)  // Remove lines shorter than 43 characters
        .map((line, index) => {
            const data = line.slice(9, -2);  // Ignore first 9 chars, last 2
            return data.slice(0, 32).match(/.{1,2}/g).join(' ');  // Group every 2 characters and join with space
        });
}

function processTxtFile(txtLines) {
    let queue = [];
    let result = [];

    // Step 1: Iterate through each line of the file
    txtLines.forEach(line => {
        let hexPairs = line.match(/\b[A-Fa-f0-9]{2}\b/g);  // Find all valid hex pairs
        
        if (hexPairs) {
            hexPairs.forEach(pair => {
                if (pair.length === 2) {
                    queue.push(pair);
                }
            });
        }
    });

    // Step 4: Dequeue 16 hex pairs at a time and create formatted lines
    while (queue.length > 0) {
        let line = queue.splice(0, 16).join(' ');  // Dequeue 16 pairs and join with a space
        result.push(line);
        console.log('Processed Line:', line);  // Print each processed line for debugging
    }

    console.log('Processed Text File Result:', result);
    return result;
}

function compareFiles(hexLines, txtLines) {
    const totalLines = Math.min(hexLines.length, txtLines.length);
    let matchingLines = 0;
    let diffLines = [];

    for (let i = 0; i < totalLines; i++) {
        if (hexLines[i].trim() === txtLines[i].trim()) {
            matchingLines++;
        } else {
            diffLines.push(i + 1);  // Line numbers start from 1
        }
    }

    return {
        total: totalLines,
        matching: matchingLines,
        different: diffLines
    };
}

function displayResults(comparison, processedHexData, processedTxtData) {
    const percentage = (comparison.matching / comparison.total * 100).toFixed(2);
    document.getElementById('percentage').textContent = percentage;
    document.getElementById('diffCount').textContent = comparison.different.length;

    document.getElementById('result').style.display = 'block';

    const processedHexSection = document.getElementById('processedHex');
    processedHexSection.innerHTML = processedHexData
        .map((line, index) => {
            const hexLineNumber = (index * 0x10).toString(16).toUpperCase().padStart(5, '0');
            const lineNumber = `<span class="line-number">${hexLineNumber}</span>`;
            const content = comparison.different.includes(index + 1) 
                ? `<span class="diff">${line}</span>` 
                : line;
            return `<span style="color: blue">${lineNumber}</span> ${content}`;
        })
        .join('<br>');

    const processedTxtSection = document.getElementById('processedTxt');
    processedTxtSection.innerHTML = processedTxtData
        .map((line, index) => {
            const hexLineNumber = (index * 0x10).toString(16).toUpperCase().padStart(5, '0');
            const lineNumber = `<span class="line-number">${hexLineNumber}</span>`;
            const content = comparison.different.includes(index + 1) 
                ? `<span class="diff">${line}</span>` 
                : line;
            return `<span style="color: blue">${lineNumber}</span> ${content}`;
        })
        .join('<br>');
}
