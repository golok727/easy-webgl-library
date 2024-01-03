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

	let lastTime = 0;
	const FPS = 10; // Desired frames per second

	const draw = (time: number) => {
		const deltaTime = time - lastTime;
		const interval = 1000 / FPS; // Interval in milliseconds for desired FPS

		if (deltaTime >= interval) {
			lastTime = time - (deltaTime % interval);

			// Your WebGL setup code here (like clearing the buffer, setting uniforms, etc.)
			gl.clear(gl.COLOR_BUFFER_BIT);
			gl.clearColor(0.0, 0.0, 0.0, 1.0);

			basicShader.setUniform3f(
				"u_Color",
				Math.random(),
				Math.random(),
				Math.random()
			);
			basicShader.setUniform1f("u_Time", performance.now());

			// Your drawing code here
			gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_INT, 0);
		}

		requestAnimationFrame(draw);
	};

	requestAnimationFrame(draw);
})();
