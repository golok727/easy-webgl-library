import WebGLCanvas from "./canvas";

export default class Renderer {
	canvas: WebGLCanvas;
	constructor(canvas: WebGLCanvas) {
		this.canvas = canvas;
	}

	public draw() {}

	public render() {}
}
