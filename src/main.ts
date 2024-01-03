import "./style.css";
import { WebGLCanvas, Shader, VertexBuffer, VertexArrayObject } from "../lib";

const container = document.querySelector(".container") as HTMLDivElement;
const canvas = new WebGLCanvas(700, 500);

container.appendChild(canvas.domElement);
(async () => {
	const gl = canvas.getContext();
	const basicShader = new Shader(
		canvas,
		"/shaders/basic.vertex.glsl",
		"/shaders/basic.fragment.glsl"
	);

	await basicShader.load();

	basicShader.warnings.uniformLocationNotFound.ignore.add("u_Time");

	const layout = new VertexBuffer(2)
		.add([-1, -1])
		.add([1, -1])
		.add([-1, 1])
		.add([1, 1])
		.getFloat32Layout(canvas, [0, 1, 2, 2, 3, 1]);

	const va = new VertexArrayObject(canvas);
	va.addLayout(layout);

	va.unbind();
	basicShader.unbind();

	gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
	basicShader.bind();
	va.bind();

	const draw = () => {
		gl.clearColor(0.0, 0.0, 0.0, 1.0);
		basicShader.setUniform3f("u_Color", 1, 0.3, 0.1);
		basicShader.setUniform1f("u_Time", performance.now());
		gl.clear(gl.COLOR_BUFFER_BIT);
		gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_INT, 0);
	};

	draw();
})();
