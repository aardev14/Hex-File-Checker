document.getElementById('compareBtn').addEventListener('click', function () {
    const hexFile = document.getElementById('hexFile').files[0];
    const txtFile = document.getElementById('txtFile').files[0];

    if (!hexFile || !txtFile) {
        alert('Please upload both files.');
        return;
    }

    // Read both files and compare
    Promise.all([readFile(hexFile), readFile(txtFile)])
        .then(([hexData, txtData]) => {
            const processedHexData = processHexFile(hexData);
            const processedTxtData = processTxtFile(txtData);
            const comparison = compareFiles(processedHexData, processedTxtData);
            displayResults(comparison);
        })
        .catch(err => console.error(err));
});

function readFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => resolve(event.target.result.split('\n'));
        reader.onerror = reject;
        reader.readAsText(file);
    });
}

function processHexFile(hexLines) {
    return hexLines
        .filter(line => line.length >= 43)  // Remove lines shorter than 43 characters
        .map(line => line.slice(9, -2).match(/.{1,2}/g).join(' '));  // Ignore first 9 chars, last 2, add spaces
}

function processTxtFile(txtLines) {
    return txtLines.map(line => line.slice(6));  // Strip the first six characters (5 numbers and a space)
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

function displayResults(comparison) {
    const percentage = (comparison.matching / comparison.total * 100).toFixed(2);
    document.getElementById('percentage').textContent = percentage;
    document.getElementById('diffCount').textContent = comparison.different.length;
    const diffLinesList = document.getElementById('diffLines');
    diffLinesList.innerHTML = '';
    comparison.different.forEach(line => {
        const li = document.createElement('li');
        li.textContent = `Line ${line}`;
        diffLinesList.appendChild(li);
    });

    document.getElementById('result').style.display = 'block';
}
