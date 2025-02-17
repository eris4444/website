<!DOCTYPE
html>
<html>
<head>
<title>C Code Runner</title>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism.min.css">
<style>
body {
    font-family: sans-serif;
    display: flex;
    flex-direction: column;
    align-items: center;
    min-height: 100vh;
    margin: 0;
    background-color: #f4f4f4;
    transition: background-color 0.3s ease;
}

.dark-theme {
    background-color: #333;
    color: #eee;
}

.dark-theme pre {
    background-color: #222;
}

.container {
    width: 80%;
    max-width: 800px;
    padding: 20px;
    border-radius: 5px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    background-color: white;
}

#code-area {
    width: 100%;
    height: 300px;
    padding: 10px;
    font-family: monospace;
    border: 1px solid #ccc;
    border-radius: 5px;
    box-sizing: border-box;
}

#output-area {
    width: 100%;
    height: 200px;
    padding: 10px;
    font-family: monospace;
    border: 1px solid #ccc;
    border-radius: 5px;
    box-sizing: border-box;
    overflow-y: auto;
    margin-top: 10px;
}

button {
    padding: 10px 20px;
    margin: 10px;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
}

button:hover {
    background-color: #45a049;
}

#theme-toggle {
    position: absolute;
    top: 10px;
    right: 10px;
}
</style>
</head>
<body>
<div class="container">
    <h1>C Code Runner</h1>
    <button id="theme-toggle">Toggle Theme</button>
    <textarea id="code-area">#include <stdio.h>

int main() {
    printf("Hello, World!\n");
    return 0;
}
    </textarea>
    <button id="run-btn">Run Code</button>
    <button id="download-btn">Download Code</button>
    <pre id="output-area"></pre>
</div>
<script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-c.min.js"></script>
<script>
document.addEventListener('DOMContentLoaded', () => {
    const codeArea = document.getElementById('code-area');
    const runBtn = document.getElementById('run-btn');
    const downloadBtn = document.getElementById('download-btn');
    const outputArea = document.getElementById('output-area');
    const themeToggle = document.getElementById('theme-toggle');

    // Theme toggle functionality
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
        Prism.highlightAll(); // Rehighlight code after theme change
    });

    runBtn.addEventListener('click', () => {
        const code = codeArea.textContent;
        outputArea.textContent = "Compiling and running code...\n\n";
        
        setTimeout(() => {
            const output = simulateCCodeExecution(code);
            outputArea.textContent += output;
        }, 1000);
    });

    downloadBtn.addEventListener('click', () => {
        const code = codeArea.textContent;
        const blob = new Blob([code], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'code.c';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

    // Simulate C code execution (very basic simulation)
    function simulateCCodeExecution(code) {
        let output = '';
        const printfRegex = /printf\s*$$\s*"([^"]*)"\s*$$/g;
        let match;

        while ((match = printfRegex.exec(code)) !== null) {
            output += match[1] + '\n';
        }

        if (output === '') {
            output = 'No output generated.\n';
        }

        output += '\nProgram finished with exit code 0';
        return output;
    }

    // Initialize syntax highlighting
    Prism.highlightAll();

    // Maintain syntax highlighting on input
    codeArea.addEventListener('input', () => {
        Prism.highlightElement(codeArea);
    });
});
</script>
</body>
</html>

