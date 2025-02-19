// Import necessary libraries
import * as PIXI from "pixi.js"
import * as Matter from "matter-js"

class CircuitSimulator {
  constructor() {
    // Initialize PIXI.js
    this.app = new PIXI.Application({
      view: document.getElementById("circuit-canvas"),
      resizeTo: document.querySelector(".workspace"),
      backgroundColor: 0xffffff,
      antialias: true,
    })

    // Initialize Matter.js
    this.engine = Matter.Engine.create()
    this.world = this.engine.world

    this.components = new Set()
    this.wires = new Set()
    this.electrons = new Set()
    this.isSimulating = false
    this.selectedComponent = null
    this.currentTool = "select"

    this.setupComponents()
    this.setupEventListeners()
    this.startRenderLoop()
  }

  setupComponents() {
    // Create container for components
    this.componentContainer = new PIXI.Container()
    this.app.stage.addChild(this.componentContainer)

    // Create container for wires
    this.wireContainer = new PIXI.Container()
    this.app.stage.addChild(this.wireContainer)

    // Create container for electrons
    this.electronContainer = new PIXI.Container()
    this.app.stage.addChild(this.electronContainer)
  }

  setupEventListeners() {
    // Component drag and drop
    document.querySelectorAll(".component").forEach((component) => {
      component.addEventListener("dragstart", this.handleDragStart.bind(this))
      component.addEventListener("dragend", this.handleDragEnd.bind(this))
    })

    this.app.view.addEventListener("dragover", this.handleDragOver.bind(this))
    this.app.view.addEventListener("drop", this.handleDrop.bind(this))

    // Tool selection
    document.querySelectorAll(".tool-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        this.setTool(btn.dataset.tool)
      })
    })

    // Simulation controls
    document.getElementById("start-stop").addEventListener("click", () => {
      this.toggleSimulation()
    })

    document.getElementById("reset").addEventListener("click", () => {
      this.resetSimulation()
    })

    // Component controls
    document.getElementById("resistance-control").addEventListener("input", (e) => {
      if (this.selectedComponent && this.selectedComponent.type === "resistor") {
        this.selectedComponent.resistance = Number.parseFloat(e.target.value)
        this.updateComponentDisplay()
      }
    })

    document.getElementById("voltage-control").addEventListener("input", (e) => {
      if (this.selectedComponent && this.selectedComponent.type === "battery") {
        this.selectedComponent.voltage = Number.parseFloat(e.target.value)
        this.updateComponentDisplay()
      }
    })

    // Canvas interaction
    this.app.view.addEventListener("mousedown", this.handleCanvasMouseDown.bind(this))
    this.app.view.addEventListener("mousemove", this.handleCanvasMouseMove.bind(this))
    this.app.view.addEventListener("mouseup", this.handleCanvasMouseUp.bind(this))
  }

  handleDragStart(e) {
    e.dataTransfer.setData("text/plain", e.target.dataset.type)
    e.dataTransfer.effectAllowed = "copy"
  }

  handleDragEnd(e) {
    e.preventDefault()
  }

  handleDragOver(e) {
    e.preventDefault()
    e.dataTransfer.dropEffect = "copy"
  }

  handleDrop(e) {
    e.preventDefault()
    const type = e.dataTransfer.getData("text/plain")
    const rect = this.app.view.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    this.createComponent(type, x, y)
  }

  createComponent(type, x, y) {
    const component = new PIXI.Container()
    component.x = x
    component.y = y
    component.type = type

    // Add component graphics based on type
    switch (type) {
      case "battery":
        this.createBattery(component)
        component.voltage = 9
        break
      case "resistor":
        this.createResistor(component)
        component.resistance = 100
        break
      case "bulb":
        this.createBulb(component)
        component.resistance = 50
        break
      case "switch":
        this.createSwitch(component)
        component.closed = false
        break
      case "ammeter":
        this.createAmmeter(component)
        break
      case "voltmeter":
        this.createVoltmeter(component)
        break
    }

    // Make component interactive
    component.interactive = true
    component.buttonMode = true
    component
      .on("pointerdown", this.onComponentDragStart.bind(this))
      .on("pointerup", this.onComponentDragEnd.bind(this))
      .on("pointerupoutside", this.onComponentDragEnd.bind(this))
      .on("pointermove", this.onComponentDragMove.bind(this))

    this.componentContainer.addChild(component)
    this.components.add(component)

    return component
  }

  createBattery(container) {
    const graphics = new PIXI.Graphics()

    // Draw battery symbol
    graphics.lineStyle(2, 0x333333)
    graphics.moveTo(-20, 0)
    graphics.lineTo(-10, 0)
    graphics.moveTo(-10, -15)
    graphics.lineTo(-10, 15)
    graphics.moveTo(10, -10)
    graphics.lineTo(10, 10)
    graphics.moveTo(10, 0)
    graphics.lineTo(20, 0)

    // Add terminals
    this.addTerminals(container)

    container.addChild(graphics)
  }

  createResistor(container) {
    const graphics = new PIXI.Graphics()

    // Draw resistor symbol
    graphics.lineStyle(2, 0x333333)
    graphics.moveTo(-20, 0)
    graphics.lineTo(-15, 0)
    graphics.lineTo(-10, -10)
    graphics.lineTo(0, 10)
    graphics.lineTo(10, -10)
    graphics.lineTo(15, 0)
    graphics.lineTo(20, 0)

    // Add terminals
    this.addTerminals(container)

    container.addChild(graphics)
  }

  createBulb(container) {
    const graphics = new PIXI.Graphics()

    // Draw bulb symbol
    graphics.lineStyle(2, 0x333333)
    graphics.beginFill(0xffd700, 0.1)
    graphics.drawCircle(0, 0, 15)
    graphics.endFill()

    // Add filament
    graphics.moveTo(-5, 5)
    graphics.lineTo(0, -5)
    graphics.lineTo(5, 5)

    // Add terminals
    this.addTerminals(container)

    container.addChild(graphics)
  }

  createSwitch(container) {
    const graphics = new PIXI.Graphics()

    // Draw switch symbol
    graphics.lineStyle(2, 0x333333)
    graphics.moveTo(-20, 0)
    graphics.lineTo(-5, 0)
    graphics.moveTo(-5, 0)
    graphics.lineTo(15, -10)

    // Add terminals
    this.addTerminals(container)

    container.addChild(graphics)
  }

  addTerminals(container) {
    const terminals = new PIXI.Graphics()
    terminals.beginFill(0x2563eb)
    terminals.drawCircle(-20, 0, 3)
    terminals.drawCircle(20, 0, 3)
    terminals.endFill()

    container.addChild(terminals)
    container.terminals = [-20, 20]
  }

  onComponentDragStart(event) {
    this.dragTarget = event.currentTarget
    this.dragData = event.data
    this.dragOffset = this.dragData.getLocalPosition(this.dragTarget)
  }

  onComponentDragEnd() {
    this.dragTarget = null
    this.dragData = null
  }

  onComponentDragMove() {
    if (this.dragTarget) {
      const newPosition = this.dragData.getLocalPosition(this.dragTarget.parent)
      this.dragTarget.x = newPosition.x - this.dragOffset.x
      this.dragTarget.y = newPosition.y - this.dragOffset.y

      // Update connected wires
      this.updateWires()
    }
  }

  setTool(tool) {
    this.currentTool = tool
    document.querySelectorAll(".tool-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.tool === tool)
    })
  }

  handleCanvasMouseDown(e) {
    const pos = this.getCanvasPosition(e)

    if (this.currentTool === "wire") {
      this.startWire(pos.x, pos.y)
    } else if (this.currentTool === "delete") {
      this.deleteAtPosition(pos.x, pos.y)
    }
  }

  handleCanvasMouseMove(e) {
    if (this.currentWire) {
      const pos = this.getCanvasPosition(e)
      this.updateCurrentWire(pos.x, pos.y)
    }
  }

  handleCanvasMouseUp(e) {
    if (this.currentWire) {
      const pos = this.getCanvasPosition(e)
      this.finishWire(pos.x, pos.y)
    }
  }

  getCanvasPosition(e) {
    const rect = this.app.view.getBoundingClientRect()
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    }
  }

  startWire(x, y) {
    const component = this.findComponentAtPosition(x, y)
    if (component) {
      this.currentWire = new PIXI.Graphics()
      this.currentWire.lineStyle(2, 0x2563eb)
      this.currentWire.moveTo(x, y)
      this.wireContainer.addChild(this.currentWire)
    }
  }

  updateCurrentWire(x, y) {
    if (this.currentWire) {
      this.currentWire.clear()
      this.currentWire.lineStyle(2, 0x2563eb)
      const start = new PIXI.Point(this.currentWire.startX, this.currentWire.startY)
      this.drawWirePath(this.currentWire, start, new PIXI.Point(x, y))
    }
  }

  finishWire(x, y) {
    const endComponent = this.findComponentAtPosition(x, y)
    if (endComponent && this.currentWire) {
      const wire = new PIXI.Graphics()
      wire.lineStyle(2, 0x2563eb)
      this.drawWirePath(wire, new PIXI.Point(this.currentWire.startX, this.currentWire.startY), new PIXI.Point(x, y))
      this.wireContainer.addChild(wire)
      this.wires.add(wire)
    }

    if (this.currentWire) {
      this.currentWire.destroy()
      this.currentWire = null
    }
  }

  drawWirePath(graphics, start, end) {
    const midX = (start.x + end.x) / 2
    graphics.moveTo(start.x, start.y)
    graphics.lineTo(midX, start.y)
    graphics.lineTo(midX, end.y)
    graphics.lineTo(end.x, end.y)
  }

  findComponentAtPosition(x, y) {
    let result = null
    this.components.forEach((component) => {
      if (component.getBounds().contains(x, y)) {
        result = component
      }
    })
    return result
  }

  deleteAtPosition(x, y) {
    const component = this.findComponentAtPosition(x, y)
    if (component) {
      this.deleteComponent(component)
    }
  }

  deleteComponent(component) {
    // Remove connected wires
    this.wires.forEach((wire) => {
      if (wire.startComponent === component || wire.endComponent === component) {
        wire.destroy()
        this.wires.delete(wire)
      }
    })

    component.destroy()
    this.components.delete(component)

    if (this.selectedComponent === component) {
      this.selectedComponent = null
      this.hideComponentControls()
    }
  }

  updateWires() {
    this.wires.forEach((wire) => {
      if (wire.startComponent && wire.endComponent) {
        wire.clear()
        wire.lineStyle(2, 0x2563eb)
        this.drawWirePath(
          wire,
          new PIXI.Point(wire.startComponent.x, wire.startComponent.y),
          new PIXI.Point(wire.endComponent.x, wire.endComponent.y),
        )
      }
    })
  }

  toggleSimulation() {
    this.isSimulating = !this.isSimulating
    const button = document.getElementById("start-stop")
    button.textContent = this.isSimulating ? "Stop Simulation" : "Start Simulation"

    if (this.isSimulating) {
      this.startSimulation()
    } else {
      this.stopSimulation()
    }
  }

  startSimulation() {
    // Start the physics engine
    Matter.Engine.run(this.engine)

    // Create electrons
    this.createElectrons()

    // Start updating measurements
    this.measurementInterval = setInterval(() => {
      this.updateMeasurements()
    }, 100)
  }

  stopSimulation() {
    // Stop the physics engine
    Matter.Engine.clear(this.engine)

    // Clear electrons
    this.electrons.forEach((electron) => {
      electron.destroy()
    })
    this.electrons.clear()

    // Stop measurements
    clearInterval(this.measurementInterval)
  }

  createElectrons() {
    this.wires.forEach((wire) => {
      for (let i = 0; i < 5; i++) {
        const electron = new PIXI.Graphics()
        electron.beginFill(0x2563eb)
        electron.drawCircle(0, 0, 2)
        electron.endFill()
        electron.alpha = 0.6

        // Position electron along the wire
        const progress = i / 5
        const pos = this.getPointAlongWire(wire, progress)
        electron.x = pos.x
        electron.y = pos.y

        this.electronContainer.addChild(electron)
        this.electrons.add(electron)
      }
    })
  }

  getPointAlongWire(wire, progress) {
    // Calculate position along wire path
    const start = new PIXI.Point(wire.startComponent.x, wire.startComponent.y)
    const end = new PIXI.Point(wire.endComponent.x, wire.endComponent.y)
    const midX = (start.x + end.x) / 2

    if (progress < 0.33) {
      // First segment
      const t = progress * 3
      return {
        x: start.x + (midX - start.x) * t,
        y: start.y,
      }
    } else if (progress < 0.66) {
      // Vertical segment
      const t = (progress - 0.33) * 3
      return {
        x: midX,
        y: start.y + (end.y - start.y) * t,
      }
    } else {
      // Last segment
      const t = (progress - 0.66) * 3
      return {
        x: midX + (end.x - midX) * t,
        y: end.y,
      }
    }
  }

  updateMeasurements() {
    // Calculate circuit values
    let totalVoltage = 0
    let totalResistance = 0

    this.components.forEach((component) => {
      if (component.type === "battery") {
        totalVoltage += component.voltage
      } else if (component.type === "resistor" || component.type === "bulb") {
        totalResistance += component.resistance
      }
    })

    const totalCurrent = totalResistance > 0 ? totalVoltage / totalResistance : 0

    // Update display
    document.getElementById("total-current").textContent = totalCurrent.toFixed(2) + " A"
    document.getElementById("battery-voltage").textContent = totalVoltage.toFixed(2) + " V"
    document.getElementById("total-resistance").textContent = totalResistance.toFixed(2) + " Ω"
  }

  resetSimulation() {
    this.stopSimulation()

    // Clear all components and wires
    this.components.forEach((component) => {
      component.destroy()
    })
    this.components.clear()

    this.wires.forEach((wire) => {
      wire.destroy()
    })
    this.wires.clear()

    // Reset measurements
    this.updateMeasurements()
  }

  startRenderLoop() {
    this.app.ticker.add(() => {
      if (this.isSimulating) {
        this.updateElectrons()
      }
    })
  }

  updateElectrons() {
    this.electrons.forEach((electron) => {
      // Move electron along its wire
      electron.x += 1
      if (electron.x > this.app.screen.width) {
        electron.x = 0
      }
    })
  }
}

// Initialize the simulator when the page loads
window.addEventListener("load", () => {
  new CircuitSimulator()
})

