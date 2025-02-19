class CircuitSimulator {
  constructor() {
    this.canvas = document.getElementById("circuit-canvas")
    this.ctx = this.canvas.getContext("2d")
    this.components = []
    this.isDragging = false
    this.selectedComponent = null
    this.gridSize = 20

    this.initializeCanvas()
    this.setupEventListeners()
    this.setupThemeToggle()
    this.render()
  }

  initializeCanvas() {
    this.resizeCanvas()
    window.addEventListener("resize", () => this.resizeCanvas())
  }

  resizeCanvas() {
    const parent = this.canvas.parentElement
    this.canvas.width = parent.clientWidth
    this.canvas.height = parent.clientHeight
  }

  setupEventListeners() {
    // Component drag and drop
    document.querySelectorAll(".component").forEach((component) => {
      component.addEventListener("dragstart", (e) => {
        e.dataTransfer.setData("text/plain", component.dataset.type)
      })
    })

    this.canvas.addEventListener("dragover", (e) => {
      e.preventDefault()
    })

    this.canvas.addEventListener("drop", (e) => {
      e.preventDefault()
      const type = e.dataTransfer.getData("text/plain")
      const rect = this.canvas.getBoundingClientRect()
      const x = Math.round((e.clientX - rect.left) / this.gridSize) * this.gridSize
      const y = Math.round((e.clientY - rect.top) / this.gridSize) * this.gridSize

      this.addComponent(type, x, y)
    })

    // Canvas interaction
    this.canvas.addEventListener("mousedown", (e) => {
      const component = this.findComponentAt(e.offsetX, e.offsetY)
      if (component) {
        this.selectedComponent = component
        this.isDragging = true
      }
    })

    this.canvas.addEventListener("mousemove", (e) => {
      if (this.isDragging && this.selectedComponent) {
        const rect = this.canvas.getBoundingClientRect()
        this.selectedComponent.x = Math.round((e.clientX - rect.left) / this.gridSize) * this.gridSize
        this.selectedComponent.y = Math.round((e.clientY - rect.top) / this.gridSize) * this.gridSize
        this.render()
      }
    })

    this.canvas.addEventListener("mouseup", () => {
      this.isDragging = false
    })

    // Toolbar buttons
    document.getElementById("run-simulation").addEventListener("click", () => {
      this.runSimulation()
    })

    document.getElementById("reset").addEventListener("click", () => {
      this.reset()
    })

    document.getElementById("save").addEventListener("click", () => {
      this.saveCircuit()
    })

    document.getElementById("load").addEventListener("click", () => {
      this.loadCircuit()
    })
  }

  setupThemeToggle() {
    const toggle = document.getElementById("theme-toggle")
    toggle.addEventListener("click", () => {
      document.body.dataset.theme = document.body.dataset.theme === "dark" ? "light" : "dark"
      toggle.textContent = document.body.dataset.theme === "dark" ? "☀️" : "🌙"
      this.render()
    })
  }

  addComponent(type, x, y) {
    this.components.push({
      type,
      x,
      y,
      rotation: 0,
      properties: this.getDefaultProperties(type),
    })
    this.render()
  }

  getDefaultProperties(type) {
    switch (type) {
      case "resistor":
        return { resistance: 100 }
      case "capacitor":
        return { capacitance: 0.1 }
      case "inductor":
        return { inductance: 0.01 }
      case "battery":
        return { voltage: 9 }
      default:
        return {}
    }
  }

  findComponentAt(x, y) {
    return this.components.find((component) => {
      const dx = x - component.x
      const dy = y - component.y
      return Math.sqrt(dx * dx + dy * dy) < 20
    })
  }

  drawGrid() {
    this.ctx.strokeStyle = getComputedStyle(document.body).getPropertyValue("--grid-color")
    this.ctx.lineWidth = 0.5

    for (let x = 0; x < this.canvas.width; x += this.gridSize) {
      this.ctx.beginPath()
      this.ctx.moveTo(x, 0)
      this.ctx.lineTo(x, this.canvas.height)
      this.ctx.stroke()
    }

    for (let y = 0; y < this.canvas.height; y += this.gridSize) {
      this.ctx.beginPath()
      this.ctx.moveTo(0, y)
      this.ctx.lineTo(this.canvas.width, y)
      this.ctx.stroke()
    }
  }

  drawComponent(component) {
    this.ctx.save()
    this.ctx.translate(component.x, component.y)
    this.ctx.rotate(component.rotation)

    this.ctx.strokeStyle = getComputedStyle(document.body).getPropertyValue("--text-primary")
    this.ctx.lineWidth = 2

    switch (component.type) {
      case "resistor":
        this.drawResistor()
        break
      case "capacitor":
        this.drawCapacitor()
        break
      case "inductor":
        this.drawInductor()
        break
      case "battery":
        this.drawBattery()
        break
    }

    this.ctx.restore()
  }

  drawResistor() {
    this.ctx.beginPath()
    this.ctx.moveTo(-25, 0)
    this.ctx.lineTo(-20, 0)
    this.ctx.lineTo(-15, -5)
    this.ctx.lineTo(-5, 5)
    this.ctx.lineTo(5, -5)
    this.ctx.lineTo(15, 5)
    this.ctx.lineTo(20, 0)
    this.ctx.lineTo(25, 0)
    this.ctx.stroke()
  }

  drawCapacitor() {
    this.ctx.beginPath()
    this.ctx.moveTo(-25, 0)
    this.ctx.lineTo(-5, 0)
    this.ctx.moveTo(-5, -15)
    this.ctx.lineTo(-5, 15)
    this.ctx.moveTo(5, -15)
    this.ctx.lineTo(5, 15)
    this.ctx.moveTo(5, 0)
    this.ctx.lineTo(25, 0)
    this.ctx.stroke()
  }

  drawInductor() {
    this.ctx.beginPath()
    this.ctx.moveTo(-25, 0)
    for (let i = 0; i < 4; i++) {
      this.ctx.arc(-15 + i * 10, 0, 5, Math.PI, 0, false)
    }
    this.ctx.lineTo(25, 0)
    this.ctx.stroke()
  }

  drawBattery() {
    this.ctx.beginPath()
    this.ctx.moveTo(-25, 0)
    this.ctx.lineTo(-5, 0)
    this.ctx.moveTo(-5, -15)
    this.ctx.lineTo(-5, 15)
    this.ctx.moveTo(5, -10)
    this.ctx.lineTo(5, 10)
    this.ctx.moveTo(5, 0)
    this.ctx.lineTo(25, 0)
    this.ctx.stroke()
  }

  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.drawGrid()
    this.components.forEach((component) => this.drawComponent(component))
  }

  runSimulation() {
    // Basic simulation logic would go here
    console.log("Running simulation...")
  }

  reset() {
    this.components = []
    this.render()
  }

  saveCircuit() {
    const data = JSON.stringify(this.components)
    localStorage.setItem("circuit", data)
    alert("Circuit saved!")
  }

  loadCircuit() {
    const data = localStorage.getItem("circuit")
    if (data) {
      this.components = JSON.parse(data)
      this.render()
      alert("Circuit loaded!")
    }
  }
}

// Initialize the simulator when the page loads
window.addEventListener("load", () => {
  new CircuitSimulator()
})

