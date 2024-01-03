export default class WebGLCanvas {
	private gl: WebGL2RenderingContext;
	private canvasElement: HTMLCanvasElement;
	private onResizeHandler?: () => void;

	constructor(width: number, height: number, contain?: false) {
		const canvas = document.createElement("canvas");

		if (contain) {
			canvas.style.width = "100%";
			canvas.style.width = "100%";
		}
		canvas.width = width;
		canvas.height = height;

		const gl = canvas.getContext("webgl2");
		if (!gl) {
			throw new Error("Your browser does not support webgl2 Renderer");
		}

		this.gl = gl;
		this.canvasElement = canvas;
	}

	get domElement() {
		return this.canvasElement;
	}

	public destroy() {
		if (this.onResizeHandler) {
			window.removeEventListener("resize", this.onResizeHandler);
		}
	}

	/**
	 * Defines what do do when user resizes the window
	 */
	public onWindowResize(onResize: (canvas: HTMLCanvasElement) => void) {
		if (this.onResizeHandler) {
			window.removeEventListener("resize", this.onResizeHandler);
		}

		this.onResizeHandler = () => onResize(this.canvasElement);
		window.addEventListener("resize", this.onResizeHandler);
	}

	/**
	 * Returns the webgl context of the canvas
	 */
	public getContext() {
		return this.gl;
	}
}
