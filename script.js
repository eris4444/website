document.addEventListener("DOMContentLoaded", () => {
  const codeArea = document.getElementById("code-area")
  const runBtn = document.getElementById("run-btn")
  const downloadBtn = document.getElementById("download-btn")
  const outputArea = document.getElementById("output-area")

  runBtn.addEventListener("click", () => {
    const code = codeArea.value
    // In a real implementation, you would send this code to a server
    // to compile and run. For this example, we'll simulate output.
    outputArea.textContent = "Compiling and running code...\n\n"

    setTimeout(() => {
      if (code.includes("printf")) {
        const printContent = code.match(/printf\s*\((["'])(.*?)\1/)
        if (printContent && printContent[2]) {
          outputArea.textContent += printContent[2] + "\n"
        }
      }
      outputArea.textContent += "\nProgram finished with exit code 0"
    }, 1000)
  })

  downloadBtn.addEventListener("click", () => {
    const code = codeArea.value
    const blob = new Blob([code], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "code.c"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  })
})

