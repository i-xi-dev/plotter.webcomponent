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
    // this.#strategy = emptyStrategy;
    this.#strategy = new PolygonDrawing(this);

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

    // test
    outputCanvas.innerHTML = `<g aria-selected="true" class="output-layer" id="default_layer"><rect width="1" height="1"/></g>`;

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

    inputCanvas.addEventListener("click", (event) => {
      this.#onClick(event as PointerEvent);
    }, { passive: true });

    inputCanvas.addEventListener("blur", () => {
      this.#strategy.terminate();
    });



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

  // get #currentOutputLayer(): SVGGElement {
  //   const layer = this.#container.querySelector('*.output-layer[aria-selected="true"]'); 
  //   if (layer instanceof SVGGElement) {
  //     return layer;
  //   }
  //   throw new Error("TODO");
  // }

  get #inputCanvas(): SVGSVGElement {
    return this.#container.querySelector('*.input-canvas') as SVGSVGElement;
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
    this.#setCurrentPoint(event.offsetX, event.offsetY);
    if (this.ownerDocument.activeElement === this) {
      this.#strategy.onMove(this.#gridX, this.#gridY);
    }
  }

  #onClick(event: PointerEvent): void {
    void event;
    this.#strategy.onActivate(this.#gridX, this.#gridY);
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



  // TODO 以下を分離する
  // TODO 以下の同じ処理は関数化する

  clearInput(): void {
    removeElementsIfExist(this.#inputCanvas, "*.input-path");
    this.clearInputTemp();
  }

  clearInputTemp(): void {
    removeElementsIfExist(this.#inputCanvas, "*.input-temp-path");
    removeElementsIfExist(this.#inputCanvas, "*.input-temp-point");
  }

  drawInputPath(commands: Array<PathCommand>): void {
    let path = this.#inputCanvas.querySelector("*.input-path");
    if (path === null) {
      path = this.ownerDocument.createElementNS(SVG_NS, "path");
      path.classList.add("input-path");
      this.#inputCanvas.append(path);
    }
    path.setAttribute("d", pathCommandsToString(commands));
  }

  drawInputTempSegment(commandTuple: [ PathCommand, PathCommand ]): void {
    let tempPath = this.#inputCanvas.querySelector("*.input-temp-path");
    if (tempPath === null) {
      tempPath = this.ownerDocument.createElementNS(SVG_NS, "path");
      tempPath.classList.add("input-temp-path");
      this.#inputCanvas.append(tempPath);
    }
    tempPath.setAttribute("d", pathCommandsToString(commandTuple));
  }

  drawInputTempVertex(x: number, y: number): void {
    let tempPoint = this.#inputCanvas.querySelector("*.input-temp-point");
    if (tempPoint === null) {
      tempPoint = this.ownerDocument.createElementNS(SVG_NS, "circle");
      tempPoint.setAttribute("r", "0.2");// XXX cssで指定できるのはChromeのみ？
      tempPoint.classList.add("input-temp-point");
      this.#inputCanvas.append(tempPoint);
    }
    tempPoint.setAttribute("cx", x.toString(10));
    tempPoint.setAttribute("cy", y.toString(10));
  }

  drawPath(commands: Array<PathCommand>): void {
    //TODO commands.lengthが1ならpathを生成し、ID振り、dをセット
    //     そうでないならdを書き換え
    void commands;
  }
}

type Point = {
  pixelX: number,
  pixelY: number,
};

interface Strategy {
  undo: () => void;
  terminate: () => void;
  onMove: (gridX: number, gridY: number) => void;
  onActivate: (gridX: number, gridY: number) => void;
}

type PathCommand = {
  c: string,
  x?: number,
  y?: number,
};

function pathCommandsToString(commands: Array<PathCommand>): string {
  return commands.map((command) => {
    // XXX とりあえず直線のみ対応
    return command.c + ((typeof command.x === "number") ? (" " + command.x.toString(10)) : "") + ((typeof command.y === "number") ? (" " + command.y.toString(10)) : "");
  }).join(" ");
}

class PolygonDrawing implements Strategy {
  #plotter: Plotter;// TODO 
  #state: number;
  #commands: Array<PathCommand>;
  constructor(plotter: Plotter) {
    this.#plotter = plotter;
    this.#state = 0;
    this.#commands = [];
  }
  undo() {
    // TODO
  }
  terminate() {
    this.#plotter.clearInputTemp();
    this.#state = 0;
  }
  onMove(gridX: number, gridY: number) {
    if (this.#state === 1) {
      if (this.#commands.length > 0) {
        const last = this.#commands[this.#commands.length - 1] as PathCommand;
        // XXX とりあえず直線のみ対応
        this.#plotter.drawInputTempSegment([
          { c: "M", x: last.x, y: last.y },
          { c: "L", x: gridX, y: gridY },
        ]);
      }
      this.#plotter.drawInputTempVertex(gridX, gridY);
    }
  }
  onActivate(gridX: number, gridY: number) {
    console.log(444, gridX, gridY)
    if (this.#state === 0) {
      this.#state = 1;
    }
    else if (this.#state === 1) {
      if (this.#commands.length > 0) {
        const first = this.#commands[0] as PathCommand;
        if ((first.x === gridX) && (first.y === gridY)) {
          this.#commands.push({ c: "z" });
          this.#plotter.drawPath(this.#commands);
          this.#plotter.clearInput();
          this.#commands.splice(0);
        }
        else {
          this.#commands.push({ c: "L", x: gridX, y: gridY });
          this.#plotter.drawInputPath(this.#commands);
        }
      }
      else {
        this.#commands.push({ c: "M", x: gridX, y: gridY });
      }
    }
  }
}

// const emptyStrategy: Strategy = {
//   onMove(gridX, gridY) {
//     console.log(gridX, gridY, ":empty");
//   },
//   onActivate(gridX, gridY) {
//     console.log(gridX, gridY, ":empty");
//   }
// };

const DEFAULT_CELL_SIZE = 24;
const DEFAULT_COLUMNS = 16;
const DEFAULT_ROWS = 16;
const SVG_NS = "http://www.w3.org/2000/svg";

function removeElementsIfExist(scope: Element, selector: string): void {
  const elements = scope.querySelectorAll(selector);
  for (const element of elements) {
    element.remove();
  }
}

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
