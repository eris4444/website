<!DOCTYPE
html>
<html>
<head>
<title>C Code Simulator</title>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism.min.css">
</head>
<body>

<h1>C Code Simulator</h1>

<textarea id="code-area" rows="10" cols="50">#include <stdio.h>

int main() {
    printf("Hello, World!\n");
    return 0;
}
</textarea><br>

<button id="run-btn">Run Code</button>
<button id="download-btn">Download Code</button>

<h2>Output</h2>
<pre id="output-area"></pre>

<script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-c.min.js"></script>

<script>
document.addEventListener('DOMContentLoaded', () => {
    const codeArea = document.getElementById('code-area');
    const runBtn = document.getElementById('run-btn');
    const downloadBtn = document.getElementById('download-btn');
    const outputArea = document.getElementById('output-area');

    runBtn.addEventListener('click', () => {
        const code = codeArea.textContent;
        outputArea.textContent = "Simulating code execution...\n\n";
        
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

        output += '\nSimulation finished.';
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

