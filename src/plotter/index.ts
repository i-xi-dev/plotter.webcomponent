import cssStyle from "./style.js";

class Plotter extends HTMLElement {

  #container: HTMLDivElement;

  constructor() {
    super();

    const styleParams: Record<string, number> = {};
    styleParams["width"] = this.#viewWidth;
    styleParams["height"] = this.#viewHeight;
    styleParams["canvasX"] = this.#canvasX;
    styleParams["canvasY"] = this.#canvasY;
    styleParams["canvasWidth"] = this.#canvasWidth;
    styleParams["canvasHeight"] = this.#canvasHeight;
    styleParams["cellSize"] = this.cellSize;

    const root = this.attachShadow({ mode: "closed", delegatesFocus: false });
    const style = cssStyle.create(this.ownerDocument, styleParams);
    root.append(style);

    this.#container = this.#createContainer(this.ownerDocument);
    root.append(this.#container);
  }

  #createContainer(doc: HTMLDocument): HTMLDivElement {
    const container = doc.createElement("div");
    container.classList.add("container");
    container.tabIndex = 0;

    const backdrop = doc.createElement("div");
    backdrop.classList.add("backdrop");
    container.append(backdrop);

    const outputBackground = doc.createElement("div");
    outputBackground.classList.add("backdrop__output-background");
    backdrop.append(outputBackground);

    const outputCanvas = doc.createElementNS(SVG_NS, "svg");
    const outputView = [
      "0",
      "0",
      this.columns.toString(10),
      this.rows.toString(10),
    ].join(" ");
    outputCanvas.setAttribute("viewBox", outputView);
    outputCanvas.classList.add("output-canvas");
    container.append(outputCanvas);

    const inputCanvas = doc.createElementNS(SVG_NS, "svg");
    const inputView = [
      (this.hSpace * -1).toString(10),
      (this.vSpace * -1).toString(10),
      (this.columns + this.hSpace * 2).toString(10),
      (this.rows + this.vSpace * 2).toString(10),
    ].join(" ");
    inputCanvas.setAttribute("viewBox", inputView);
    inputCanvas.classList.add("input-canvas");
    container.append(inputCanvas);

    // test
    inputCanvas.innerHTML = `<rect width="1" height="2"/>`;

    const overlay = doc.createElement("div");
    overlay.classList.add("overlay");
    container.append(overlay);

    const exterior = doc.createElement("div");
    exterior.classList.add("overlay__exterior");
    overlay.append(exterior);

    const gridRules = doc.createElement("div");
    gridRules.classList.add("overlay__grid-rules");
    overlay.append(gridRules);

    return container;
  }

  get #canvasX(): number {
    return this.hSpace * this.cellSize;
  }

  get #canvasY(): number {
    return this.vSpace * this.cellSize;
  }

  get #canvasWidth(): number {
    return this.columns * this.cellSize;
  }

  get #canvasHeight(): number {
    return this.rows * this.cellSize;
  }

  get #viewWidth(): number {
    return (this.columns * this.cellSize) + (this.hSpace * this.cellSize * 2);
  }

  get #viewHeight(): number {
    return (this.rows * this.cellSize) + (this.vSpace * this.cellSize * 2);
  }

  get cellSize(): number {
    return toInteger(this.getAttribute("cell-size"), DEFAULT_CELL_SIZE);
  }

  get columns(): number {
    return toInteger(this.getAttribute("columns"), DEFAULT_COLUMNS);
  }

  get rows(): number {
    return toInteger(this.getAttribute("rows"), DEFAULT_ROWS);
  }

  get hSpace(): number {
    return toInteger(this.getAttribute("h-space"), DEFAULT_COLUMNS / 4);
  }

  get vSpace(): number {
    return toInteger(this.getAttribute("v-space"), DEFAULT_ROWS / 4);
  }
}

const DEFAULT_CELL_SIZE = 24;
const DEFAULT_COLUMNS = 16;
const DEFAULT_ROWS = 16;
const SVG_NS = "http://www.w3.org/2000/svg";

function toInteger(str: string | null, defaultValue: number): number {
  if (typeof str === "string") {
    const num = Number.parseInt(str, 10);
    if (Number.isSafeInteger(num)) {
      return num;
    }
  }
  return defaultValue;
}

export {
  Plotter,
};
