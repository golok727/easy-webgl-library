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

	basicShader.warnings.uniformLocationNotFound.allow = false;
	basicShader.warnings.uniformLocationNotFound.ignore.add("u_Time");
	basicShader.warnings.uniformLocationNotFound.ignore.add("u_Resolution");
	// basicShader.warnings.uniformLocationNotFound.ignore.add("u_Color");

	// const pos = new VertexBuffer(2)
	// 	.add([-1, -1])
	// 	.add([1, -1])
	// 	.add([-1, 1])
	// 	.add([1, 1])
	// 	.getFloat32Layout(canvas, {
	// 		indices: [0, 1, 2, 2, 3, 1],
	// 	});

	const pos = new VertexBuffer(2)
		.add([-1, -1])
		.add([1, -1])
		.add([-1, 1])
		.add([1, 1])
		.getFloat32Layout(canvas, {
			indices: [0, 1, 2, 2, 3, 1],
		});

	const va = new VertexArrayObject(canvas);
	va.addLayout(pos);

	va.unbind();
	basicShader.unbind();

	gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
	basicShader.bind();
	va.bind();

	basicShader.setUniform2f("u_Resolution", gl.canvas.width, gl.canvas.height);
	let lastTime = 0;

	const FPS = 60; // Desired frames per second

	const draw = () => {
		gl.clear(gl.COLOR_BUFFER_BIT);
		gl.clearColor(0.0, 0.0, 0.0, 1.0);

		basicShader.setUniform3f("u_Color", 0.1, 0.3, 0.7);
		basicShader.setUniform1f("u_Time", performance.now());

		gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_INT, 0);
	};

	const render = (time: number) => {
		const deltaTime = time - lastTime;
		const interval = 1000 / FPS; // Interval in milliseconds for desired FPS

		if (deltaTime >= interval) {
			lastTime = time - (deltaTime % interval);
			draw();
		}
		requestAnimationFrame(render);
	};

	requestAnimationFrame(render);
})();
