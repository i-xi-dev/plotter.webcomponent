
export default {
  create(doc: HTMLDocument, params: Record<string, number>): HTMLStyleElement {
    const canvasXNum = params["canvasX"] as number;
    const canvasYNum = params["canvasY"] as number;
    const canvasWidthNum = params["canvasWidth"] as number;
    const canvasHeightNum = params["canvasHeight"] as number;
    const height = (params["height"] as number).toString(10);
    const width = (params["width"] as number).toString(10);
    const canvasX = canvasXNum.toString(10);
    const canvasY = canvasYNum.toString(10);
    const canvasWidth = canvasWidthNum.toString(10);
    const canvasHeight = canvasHeightNum.toString(10);
    const cellSize = (params["cellSize"] as number).toString(10);
    const canvasX2 = (canvasXNum + canvasWidthNum).toString(10);
    const canvasY2 = (canvasYNum + canvasHeightNum).toString(10);

    const text = `
:host {
  --height: ${ height }px;
  --width: ${ width }px;
  display: block;
  height: var(--height);
  width: var(--width);
}

*.container {
  height: var(--height);
  max-height: var(--height);
  max-width: var(--width);
  min-height: var(--height);
  min-width: var(--width);
  overflow: hidden;
  position: relative;
  width: var(--width);
}

*.container:focus {
  outline: medium solid #08F8;
}

*.backdrop {
  background-color: #d8d8d8;
  bottom: 0px;
  left: 0px;
  pointer-events: none;
  position: absolute;
  right: 0px;
  top: 0px;
}

*.backdrop__output-background {
  background-color: #d8d8d8;
  box-shadow: 0px 4px 8px #0004,
    0px 8px 16px #0004;
  height: ${ canvasHeight }px;
  left: ${ canvasX }px;
  position: absolute;
  top: ${ canvasY }px;
  width: ${ canvasWidth }px;
}

*.output-canvas {
  height: ${ canvasHeight }px;
  left: ${ canvasX }px;
  overflow: hidden;
  pointer-events: none;
  position: absolute;
  top: ${ canvasY }px;
  width: ${ canvasWidth }px;
}

*.input-canvas {
  bottom: 0px;
  left: 0px;
  overflow: hidden;
  position: absolute;
  right: 0px;
  top: 0px;
}

*.input-path,
*.input-temp-path {
  fill: none;
  stroke: rgb(35, 197, 185);
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 0.1;
}

*.input-temp-path {
  stroke-opacity: 0.5;
}

*.input-temp-point {
  fill: rgb(35, 197, 185);
}



*.overlay {
  bottom: 0px;
  left: 0px;
  pointer-events: none;
  position: absolute;
  right: 0px;
  top: 0px;
}

*.overlay__grid-rules {
  background-image: ${ createGridRulesImage() };
  background-position: 0px 0px;
  background-size: ${ cellSize }px ${ cellSize }px;
  bottom: 0px;
  left: 0px;
  position: absolute;
  right: 0px;
  top: 0px;
}

*.overlay__exterior {
  background-color: #0008;
  clip-path: path("M 0 0 L ${ width } 0 L ${ width } ${ height } L 0 ${ height } z M ${ canvasX } ${ canvasY } L ${ canvasX } ${ canvasY2 } L ${ canvasX2 } ${ canvasY2 } L ${ canvasX2 } ${ canvasY } z");
  bottom: 0px;
  left: 0px;
  position: absolute;
  right: 0px;
  top: 0px;
}

    `;

    const element = doc.createElement("style");
    element.textContent = text;
    return element;
  },
};

function createGridRulesImage(): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
  <path
  d="M 0 4 L 0 0 L 4 0 M 12 0 L 16 0 L 16 4 M 16 12 L 16 16 L 12 16 M 4 16 L 0 16 L 0 12"
  fill="none"
  stroke="#fff"
  stroke-opacity="0.4"
  stroke-width="2"
  vector-effect="non-scaling-stroke"/>
  </svg>`;
  return `url("data:image/svg+xml,${ globalThis.encodeURIComponent(svg.replace(/\n/g, "")) }")`;
}
