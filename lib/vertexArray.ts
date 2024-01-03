import WebGLCanvas from "./canvas";
import { GLError } from "./error";
import { VertexLayout } from "./vertexBuffer";

export default class VertexArrayObject {
	private readonly vao: WebGLVertexArrayObject;
	private layouts: Set<VertexLayout<any>>;
	private canvas: WebGLCanvas;

	constructor(canvas: WebGLCanvas) {
		this.layouts = new Set();
		this.canvas = canvas;
		this.vao = this.generateVertexArray();
		this.bind();
	}
	private generateVertexArray() {
		const gl = this.canvas.getContext();
		const vao = gl.createVertexArray();
		if (!vao) throw GLError.Error("Error creating Vertex Array Object");
		return vao;
	}

	public addLayout<T extends BufferSource>(layout: VertexLayout<T>) {
		if (this.layouts.has(layout)) return this;

		const { vbo, ibo } = layout;
		this.bind();
		vbo.bind();
		if (ibo) ibo.bind();

		const gl = this.canvas.getContext();

		layout.attributeLocations.forEach((location, i) => {
			gl.enableVertexAttribArray(location);
			gl.vertexAttribPointer(
				location,
				layout.getSizeOfAttribute(i),
				layout.type,
				false,
				layout.stride,
				layout.getOffsetOfAttribute(i)
			);
		});

		this.unbind();
		vbo.unbind();
		if (ibo) ibo.unbind();
		this.layouts.add(layout);
		return this;
	}

	public bind() {
		const gl = this.canvas.getContext();
		gl.bindVertexArray(this.vao);
	}

	public unbind() {
		this.canvas.getContext().bindVertexArray(null);
	}

	public delete() {
		this.canvas.getContext().deleteVertexArray(this.vao);
	}
}
