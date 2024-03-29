# Vertexify

A WebGL-2 Abstraction

`basic.vertex.glsl`

```glsl
#version 300 es
layout (location = 0) in vec2 vPosition;
layout (location = 1) in vec3 vColor; 

out vec3 color;
void main()
{
  color = vColor;
  gl_Position = vec4(vPosition, 0.0, 1.0);
}
```

`basic.fragment.glsl`
```glsl

#version 300 es
precision highp float; 

out vec4 fragColor; 
in vec3 color; 
void main()
{
  fragColor = vec4(color, 1.0); 
}

```

`main.ts`
```ts
import "./style.css";
import { WebGLCanvas, Shader, VertexBuffer, VertexArrayObject } from "@golok/vertexify";

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

	const layout = new VertexBuffer(2, 3)
		.add([-1, -1], [1, 1, 0])
		.add([1, -1], [1, 1, 1])
		.add([-1, 1], [1, 1, 1])
		.add([1, 1], [1, 1, 1])
		.getFloat32Layout(canvas, [0, 1, 2, 2, 3, 1]);

	const vao = new VertexArrayObject(canvas);
	vao.addLayout(layout);

	vao.unbind();
	basicShader.unbind();

	gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

	basicShader.bind();
	vao.bind();
	const draw = () => {
		gl.clearColor(0.0, 0.0, 0.0, 1.0);
		gl.clear(gl.COLOR_BUFFER_BIT);
		gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_INT, 0);
	};

	draw();
})();

```