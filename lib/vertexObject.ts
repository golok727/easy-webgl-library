import WebGLCanvas from "./canvas";
import { GLError } from "./error";

export class VertexBufferObject {
	private readonly buffer: WebGLBuffer;
	private canvas: WebGLCanvas;

	constructor(canvas: WebGLCanvas, data: BufferSource) {
		this.canvas = canvas;
		const gl = this.canvas.getContext();
		this.buffer = this.createBuffer();

		this.bind();
		gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
		this.unbind();
	}

	private createBuffer() {
		const gl = this.canvas.getContext();
		const buffer = gl.createBuffer();
		if (!buffer) throw GLError.Error("Error creating vertex buffer");
		return buffer;
	}

	public bind() {
		const gl = this.canvas.getContext();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
	}

	public unbind() {
		const gl = this.canvas.getContext();
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
	}

	public delete() {
		this.canvas.getContext().deleteBuffer(this.buffer);
	}
}
