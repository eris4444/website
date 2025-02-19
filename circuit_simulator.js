// Import Paper.js
import * as paper from "paper"

class CircuitSimulator {
  constructor() {
    // Initialize Paper.js
    paper.setup("circuit-canvas")
    this.initializeCanvas()
    this.setupEventListeners()
    this.components = new Set()
    this.wires = new Set()
    this.selectedComponent = null
    this.currentTool = "select"
    this.draggedComponent = null
    this.startPoint = null
    this.oscilloscope = null
  }

  initializeCanvas() {
    // Set up the grid
    const grid = new paper.Group()
    const gridSize = 20
    const width = paper.view.bounds.width
    const height = paper.view.bounds.height

    for (let x = 0; x < width; x += gridSize) {
      const line = new paper.Path.Line(new paper.Point(x, 0), new paper.Point(x, height))
      line.strokeColor = getComputedStyle(document.body).getPropertyValue("--grid-color")
      line.strokeWidth = 0.5
      grid.addChild(line)
    }

    for (let y = 0; y < height; y += gridSize) {
      const line = new paper.Path.Line(new paper.Point(0, y), new paper.Point(width, y))
      line.strokeColor = getComputedStyle(document.body).getPropertyValue("--grid-color")
      line.strokeWidth = 0.5
      grid.addChild(line)
    }

    grid.sendToBack()

    // Set up view settings
    paper.settings.handleSize = 8
    paper.view.onFrame = (event) => this.onFrame(event)
    paper.view.onResize = () => this.onResize()
  }

  setupEventListeners() {
    // Tool buttons
    document.getElementById("select-tool").addEventListener("click", () => this.setTool("select"))
    document.getElementById("wire-tool").addEventListener("click", () => this.setTool("wire"))

    // Component buttons
    document.querySelectorAll(".component-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const type = btn.dataset.component
        this.createComponent(type, paper.view.center)
      })
    })

    // Action buttons
    document.getElementById("simulate").addEventListener("click", () => this.startSimulation())
    document.getElementById("reset").addEventListener("click", () => this.resetSimulation())

    // Canvas events
    const tool = new paper.Tool()

    tool.onMouseDown = (event) => {
      if (this.currentTool === "select") {
        this.handleSelectToolMouseDown(event)
      } else if (this.currentTool === "wire") {
        this.handleWireToolMouseDown(event)
      }
    }

    tool.onMouseDrag = (event) => {
      if (this.currentTool === "select") {
        this.handleSelectToolMouseDrag(event)
      } else if (this.currentTool === "wire") {
        this.handleWireToolMouseDrag(event)
      }
    }

    tool.onMouseUp = (event) => {
      if (this.currentTool === "select") {
        this.handleSelectToolMouseUp(event)
      } else if (this.currentTool === "wire") {
        this.handleWireToolMouseUp(event)
      }
    }

    // Properties panel
    document.getElementById("component-value").addEventListener("change", (e) => {
      if (this.selectedComponent) {
        this.selectedComponent.value = Number.parseFloat(e.target.value)
        this.updateComponent(this.selectedComponent)
      }
    })

    document.getElementById("component-rotation").addEventListener("input", (e) => {
      if (this.selectedComponent) {
        this.selectedComponent.rotation = Number.parseInt(e.target.value)
        this.updateComponent(this.selectedComponent)
      }
    })

    document.getElementById("delete-component").addEventListener("click", () => {
      if (this.selectedComponent) {
        this.deleteComponent(this.selectedComponent)
      }
    })
  }

  setTool(tool) {
    this.currentTool = tool
    document.querySelectorAll(".tool-btn").forEach((btn) => btn.classList.remove("active"))
    document.getElementById(`${tool}-tool`).classList.add("active")
  }

  createComponent(type, position) {
    const component = new paper.Group()
    component.type = type
    component.position = position
    component.value = this.getDefaultValue(type)

    // Draw component based on type
    switch (type) {
      case "resistor":
        this.drawResistor(component)
        break
      case "capacitor":
        this.drawCapacitor(component)
        break
      case "inductor":
        this.drawInductor(component)
        break
      case "voltage-source":
        this.drawVoltageSource(component)
        break
      case "current-source":
        this.drawCurrentSource(component)
        break
      case "ground":
        this.drawGround(component)
        break
    }

    this.components.add(component)
    this.selectComponent(component)
    return component
  }

  drawResistor(group) {
    const path = new paper.Path()
    path.strokeColor = getComputedStyle(document.body).getPropertyValue("--text-primary")
    path.strokeWidth = 2

    path.add(new paper.Point(-20, 0))
    path.add(new paper.Point(-15, 0))
    path.add(new paper.Point(-10, -5))
    path.add(new paper.Point(0, 5))
    path.add(new paper.Point(10, -5))
    path.add(new paper.Point(15, 0))
    path.add(new paper.Point(20, 0))

    group.addChild(path)
    this.addTerminals(group)
  }

  drawCapacitor(group) {
    const path = new paper.Path()
    path.strokeColor = getComputedStyle(document.body).getPropertyValue("--text-primary")
    path.strokeWidth = 2

    path.add(new paper.Point(-20, 0))
    path.add(new paper.Point(-5, 0))

    const plate1 = new paper.Path.Line(new paper.Point(-5, -10), new paper.Point(-5, 10))
    const plate2 = new paper.Path.Line(new paper.Point(5, -10), new paper.Point(5, 10))

    path.add(new paper.Point(5, 0))
    path.add(new paper.Point(20, 0))

    group.addChild(path)
    group.addChild(plate1)
    group.addChild(plate2)
    this.addTerminals(group)
  }

  drawInductor(group) {
    const path = new paper.Path()
    path.strokeColor = getComputedStyle(document.body).getPropertyValue("--text-primary")
    path.strokeWidth = 2

    path.add(new paper.Point(-20, 0))

    // Draw coils
    for (let i = 0; i < 4; i++) {
      const center = new paper.Point(-10 + i * 10, 0)
      const radius = 5
      path.arcTo(
        center.add(new paper.Point(0, -radius)),
        center.add(new paper.Point(radius, 0)),
        center.add(new paper.Point(0, radius)),
      )
    }

    path.add(new paper.Point(20, 0))

    group.addChild(path)
    this.addTerminals(group)
  }

  drawVoltageSource(group) {
    const circle = new paper.Path.Circle(new paper.Point(0, 0), 15)
    circle.strokeColor = getComputedStyle(document.body).getPropertyValue("--text-primary")
    circle.strokeWidth = 2

    const plus = new paper.Group([
      new paper.Path.Line(new paper.Point(-2, -5), new paper.Point(2, -5)),
      new paper.Path.Line(new paper.Point(0, -7), new paper.Point(0, -3)),
    ])
    plus.strokeColor = getComputedStyle(document.body).getPropertyValue("--text-primary")
    plus.strokeWidth = 2

    const minus = new paper.Path.Line(new paper.Point(-2, 5), new paper.Point(2, 5))
    minus.strokeColor = getComputedStyle(document.body).getPropertyValue("--text-primary")
    minus.strokeWidth = 2

    group.addChild(circle)
    group.addChild(plus)
    group.addChild(minus)
    this.addTerminals(group)
  }

  drawCurrentSource(group) {
    const circle = new paper.Path.Circle(new paper.Point(0, 0), 15)
    circle.strokeColor = getComputedStyle(document.body).getPropertyValue("--text-primary")
    circle.strokeWidth = 2

    const arrow = new paper.Path()
    arrow.strokeColor = getComputedStyle(document.body).getPropertyValue("--text-primary")
    arrow.strokeWidth = 2
    arrow.add(new paper.Point(0, -7))
    arrow.add(new paper.Point(0, 7))
    arrow.add(new paper.Point(-3, 4))
    arrow.add(new paper.Point(0, 7))
    arrow.add(new paper.Point(3, 4))

    group.addChild(circle)
    group.addChild(arrow)
    this.addTerminals(group)
  }

  drawGround(group) {
    const path = new paper.Path()
    path.strokeColor = getComputedStyle(document.body).getPropertyValue("--text-primary")
    path.strokeWidth = 2

    path.add(new paper.Point(0, -10))
    path.add(new paper.Point(0, 0))
    path.add(new paper.Point(-10, 0))
    path.add(new paper.Point(10, 0))

    const line2 = new paper.Path.Line(new paper.Point(-6, 5), new paper.Point(6, 5))
    const line3 = new paper.Path.Line(new paper.Point(-2, 10), new paper.Point(2, 10))

    group.addChild(path)
    group.addChild(line2)
    group.addChild(line3)
    this.addTerminals(group)
  }

  addTerminals(group) {
    const terminal1 = new paper.Path.Circle(new paper.Point(-20, 0), 3)
    const terminal2 = new paper.Path.Circle(new paper.Point(20, 0), 3)

    terminal1.fillColor = getComputedStyle(document.body).getPropertyValue("--accent-primary")
    terminal2.fillColor = getComputedStyle(document.body).getPropertyValue("--accent-primary")

    group.addChild(terminal1)
    group.addChild(terminal2)
    group.terminals = [terminal1, terminal2]
  }

  getDefaultValue(type) {
    switch (type) {
      case "resistor":
        return 1000 // 1kΩ
      case "capacitor":
        return 0.000001 // 1µF
      case "inductor":
        return 0.001 // 1mH
      case "voltage-source":
        return 5 // 5V
      case "current-source":
        return 0.001 // 1mA
      default:
        return 0
    }
  }

  handleSelectToolMouseDown(event) {
    const hitResult = paper.project.hitTest(event.point, {
      tolerance: 5,
      fill: true,
      stroke: true,
      segments: true,
    })

    if (hitResult) {
      const component = this.findComponentByChild(hitResult.item)
      if (component) {
        this.draggedComponent = component
        this.selectComponent(component)
      }
    } else {
      this.selectComponent(null)
    }
  }

  handleSelectToolMouseDrag(event) {
    if (this.draggedComponent) {
      this.draggedComponent.position = this.draggedComponent.position.add(event.delta)
      this.updateConnectedWires(this.draggedComponent)
    }
  }

  handleSelectToolMouseUp() {
    if (this.draggedComponent) {
      // Snap to grid
      const gridSize = 20
      const pos = this.draggedComponent.position
      this.draggedComponent.position = new paper.Point(
        Math.round(pos.x / gridSize) * gridSize,
        Math.round(pos.y / gridSize) * gridSize,
      )
      this.updateConnectedWires(this.draggedComponent)
      this.draggedComponent = null
    }
  }

  handleWireToolMouseDown(event) {
    const hitResult = paper.project.hitTest(event.point, {
      tolerance: 5,
      fill: true,
      stroke: true,
    })

    if (hitResult) {
      const component = this.findComponentByChild(hitResult.item)
      if (component && component.terminals) {
        const terminal = component.terminals.find((t) => t.bounds.contains(event.point))
        if (terminal) {
          this.startPoint = terminal.position
        }
      }
    }
  }

  handleWireToolMouseDrag(event) {
    if (this.startPoint) {
      if (this.currentWire) {
        this.currentWire.remove()
      }
      this.currentWire = this.drawWire(this.startPoint, event.point)
    }
  }

  handleWireToolMouseUp(event) {
    if (this.startPoint && this.currentWire) {
      const hitResult = paper.project.hitTest(event.point, {
        tolerance: 5,
        fill: true,
        stroke: true,
      })

      if (hitResult) {
        const component = this.findComponentByChild(hitResult.item)
        if (component && component.terminals) {
          const terminal = component.terminals.find((t) => t.bounds.contains(event.point))
          if (terminal) {
            this.currentWire.remove()
            const wire = this.createWire(this.startPoint, terminal.position)
            this.wires.add(wire)
          }
        }
      }
      this.currentWire = null
    }
    this.startPoint = null
  }

  drawWire(start, end) {
    const path = new paper.Path()
    path.strokeColor = getComputedStyle(document.body).getPropertyValue("--accent-primary")
    path.strokeWidth = 2

    const midX = (start.x + end.x) / 2
    path.add(start)
    path.add(new paper.Point(midX, start.y))
    path.add(new paper.Point(midX, end.y))
    path.add(end)

    return path
  }

  createWire(start, end) {
    const wire = new paper.Group()
    const path = this.drawWire(start, end)
    wire.addChild(path)
    wire.startPoint = start
    wire.endPoint = end
    return wire
  }

  updateConnectedWires(component) {
    this.wires.forEach((wire) => {
      component.terminals.forEach((terminal) => {
        if (wire.startPoint.equals(terminal.position)) {
          wire.firstChild.segments[0].point = terminal.position
          wire.firstChild.segments[1].point = new paper.Point(
            (wire.startPoint.x + wire.endPoint.x) / 2,
            terminal.position.y,
          )
        }
        if (wire.endPoint.equals(terminal.position)) {
          wire.firstChild.segments[3].point = terminal.position
          wire.firstChild.segments[2].point = new paper.Point(
            (wire.startPoint.x + wire.endPoint.x) / 2,
            terminal.position.y,
          )
        }
      })
    })
  }

  findComponentByChild(item) {
    let current = item
    while (current) {
      if (this.components.has(current)) {
        return current
      }
      current = current.parent
    }
    return null
  }

  selectComponent(component) {
    if (this.selectedComponent) {
      this.selectedComponent.children.forEach((child) => {
        if (child.strokeColor) child.strokeColor.alpha = 1
      })
    }

    this.selectedComponent = component

    if (component) {
      component.children.forEach((child) => {
        if (child.strokeColor) child.strokeColor.alpha = 0.8
      })
      this.showComponentProperties(component)
    } else {
      this.hideComponentProperties()
    }
  }

  showComponentProperties(component) {
    document.querySelector(".no-selection").classList.add("hidden")
    document.querySelector(".component-properties").classList.remove("hidden")

    const valueInput = document.getElementById("component-value")
    const unitSelect = document.getElementById("component-unit")
    const rotationInput = document.getElementById("component-rotation")

    valueInput.value = component.value
    rotationInput.value = component.rotation || 0
  }

  hideComponentProperties() {
    document.querySelector(".no-selection").classList.remove("hidden")
    document.querySelector(".component-properties").classList.add("hidden")
  }

  deleteComponent(component) {
    // Remove connected wires
    this.wires.forEach((wire) => {
      component.terminals.forEach((terminal) => {
        if (wire.startPoint.equals(terminal.position) || wire.endPoint.equals(terminal.position)) {
          wire.remove()
          this.wires.delete(wire)
        }
      })
    })

    component.remove()
    this.components.delete(component)
    this.selectComponent(null)
  }

  startSimulation() {
    if (!this.oscilloscope) {
      this.oscilloscope = document.getElementById("oscilloscope")
      this.oscilloscope.classList.remove("hidden")
      this.initializeOscilloscope()
    }
    // Add simulation logic here
  }

  resetSimulation() {
    this.components.forEach((component) => this.deleteComponent(component))
    if (this.oscilloscope) {
      this.oscilloscope.classList.add("hidden")
    }
  }

  initializeOscilloscope() {
    const canvas = document.getElementById("scope-canvas")
    const ctx = canvas.getContext("2d")

    // Set up oscilloscope display
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    ctx.strokeStyle = getComputedStyle(document.body).getPropertyValue("--accent-primary")
    ctx.lineWidth = 2

    // Add oscilloscope visualization logic here
  }

  onFrame(event) {
    // Add animation updates here
  }

  onResize() {
    // Update canvas size and grid
    this.initializeCanvas()
  }
}

// Initialize the simulator when the page loads
window.addEventListener("load", () => {
  new CircuitSimulator()
})

