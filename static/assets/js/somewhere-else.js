(() => {
  // <stdin>
  var CanvasHandler = class {
    constructor() {
      this.canvas = document.getElementById("canvas");
      this.context = this.canvas.getContext("2d");
      this.hovered = false;
      this.drawPortCircle(this.portCenterX, this.portCenterY);
    }
    get canvasPX() {
      return this.canvas.width / this.canvas.offsetWidth;
    }
    get portCenterX() {
      return this.canvas.width * 0.75;
    }
    get portCenterY() {
      return this.canvas.height * 0.95;
    }
    get connectionColor() {
      return this.hovered ? "#AF102E" : "#550E2B";
    }
    onmouseover(element) {
      this.hovered = true;
      this.moveLineToElement(element);
    }
    onmouseleave(element) {
      this.hovered = false;
      this.moveLineToElement(element);
    }
    /**
     * 
     * @param {HTMLElement} element
     */
    moveLineToElement(element) {
      const offset = element.offsetWidth * this.canvasPX / 2;
      const centerX = element.offsetLeft * this.canvasPX + offset;
      const centerY = element.offsetTop * this.canvasPX + offset - 8 * 16;
      this.clear();
      this.drawIconCircle(centerX, centerY, offset);
      this.drawPortCircle(this.portCenterX, this.portCenterY);
      this.drawLine(this.portCenterX, this.portCenterY, centerX, centerY);
    }
    /**
     * @param {number} centerX
     * @param {number} centerY
     * @param {number} offset
     */
    drawIconCircle(centerX, centerY, offset) {
      this.context.beginPath();
      this.context.fillStyle = this.connectionColor;
      this.context.arc(centerX, centerY, offset / this.canvasPX, 0, 2 * Math.PI);
      this.context.fill();
    }
    drawPortCircle(portCenterX, portCenterY) {
      this.context.beginPath();
      this.context.fillStyle = this.connectionColor;
      this.context.arc(portCenterX, portCenterY, 32, 0, 2 * Math.PI);
      this.context.fill();
    }
    drawLine(fromX, fromY, toX, toY) {
      this.context.beginPath();
      this.context.strokeStyle = this.connectionColor;
      this.context.lineWidth = 20;
      this.context.lineCap = "round";
      this.context.moveTo(fromX, fromY);
      const vertical = toX < fromX ? fromY + toX - fromX : fromY + fromX - toX;
      if (vertical < toY) {
        const diagonalHeight = Math.min(vertical, Math.abs(fromX - toX));
        this.context.lineTo(toX + diagonalHeight, fromY);
        this.context.lineTo(toX, fromY - diagonalHeight);
      } else {
        this.context.lineTo(toX, vertical);
      }
      this.context.lineTo(toX, toY);
      this.context.stroke();
    }
    clear() {
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  };
  var handler = new CanvasHandler();
  window.addEventListener("load", function() {
    let boxes = "";
    for (let i = 0; i < 200; i++) {
      const colorRoll = Math.random();
      const color = colorRoll < 0.15 ? "#ffffff" : colorRoll < 0.55 ? "#d9e0e8" : "#8f969f";
      const x = Math.round(Math.random() * 99) + 1;
      const y = Math.round(i * 1) + i * 2 % 5 + 1;
      const diffusion = Math.random() < 0.12 ? "4px" : Math.random() < 0.45 ? "2px" : "1px";
      boxes += `${x}vw ${y}vh ${diffusion} ${color}`;
      if (i < 199)
        boxes += ", ";
    }
    document.querySelector(".stars").setAttribute("style", "box-shadow: " + boxes + ";");
  });
  window.addEventListener("mouseover", (ev) => {
    const el = ev.target;
    if (el.classList.contains("icon")) {
      handler.onmouseover(el);
    }
  });
  window.addEventListener("mouseout", (ev) => {
    const el = ev.target;
    if (el.classList.contains("icon")) {
      handler.onmouseleave(el);
    }
  });
})();
