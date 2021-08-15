import cssStyle from "./style.js";

class Plotter extends HTMLElement {

  #currentPoint: Point;
  #gridX: number;
  #gridY: number;
  #strategy: Strategy;

  #container: HTMLDivElement;

  constructor() {
    super();

    this.#currentPoint = { pixelX: 0, pixelY: 0 };
    this.#gridX = 0;
    this.#gridY = 0;
    this.#strategy = emptyStrategy;

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

    inputCanvas.addEventListener("pointermove", (event) => {
      this.#onPointerMove(event);
    }, { passive: true });

    // test
    inputCanvas.innerHTML = `<rect width="1" height="2"/>`;

    const overlay = doc.createElement("div");
    overlay.classList.add("overlay");
    container.append(overlay);

    const gridRules = doc.createElement("div");
    gridRules.classList.add("overlay__grid-rules");
    overlay.append(gridRules);

    const exterior = doc.createElement("div");
    exterior.classList.add("overlay__exterior");
    overlay.append(exterior);

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

  get snapToGrid(): boolean {
    return this.hasAttribute("snap-to-grid");
  }

  #onPointerMove(event: PointerEvent): void {
    if (this.ownerDocument.activeElement !== this) {
      return;
    }

    this.#setCurrentPoint(event.offsetX, event.offsetY);
    this.#strategy.onMove(this.#gridX, this.#gridY);
  }

  #setCurrentPoint(x: number, y: number): void {
    this.#currentPoint.pixelX = x;
    this.#currentPoint.pixelY = y;
    this.#gridX = this.#computeGridPos("x", x);
    this.#gridY = this.#computeGridPos("y", y);
  }

  // #publish(label: string, x: number, y: number): void {
  //   this.dispatchEvent(new CustomEvent(label, {
  //     detail: { x, y },
  //   }));
  // }

  #computeGridPos(axis: "x" | "y", pixelPos: number): number {
    const cells = (axis === "x") ? this.columns : this.rows;
    const space = (axis === "x") ? this.hSpace : this.vSpace;
    const unit = pixelPos / this.cellSize;

    let w: number;
    if (unit >= (cells + space * 2)) {
      w = (cells + space * 2);
    }
    else if (unit <= 0) {
      w = 0;
    }
    else if (this.snapToGrid === true) {
      const integralPart = Math.trunc(unit);
      const fractionalPart = unit - integralPart;
      if (fractionalPart > 0.75) {
        w = integralPart + 1;
      }
      else if (fractionalPart >= 0.25) {
        w = integralPart + 0.5;
      }
      else {
        w = integralPart;
      }
    }
    else {
      w = unit;
    }
    return w - space;
  }

  get gridX(): number {
    return this.#gridX;
  }

  get gridY(): number {
    return this.#gridY;
  }
}

type Point = {
  pixelX: number,
  pixelY: number,
};

interface Strategy {
  onMove: (gridX: number, gridY: number) => void;
}

// class PathDrawing implements Strategy {
//   constructor(plotter: Plotter) {

//   }
//   onMove(gridX, gridY) {
//   }
// }

const emptyStrategy: Strategy = {
  onMove(gridX, gridY) {
    console.log(gridX, gridY, ":empty");
  }
};

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
