import { WebGLCanvas } from ".";

class ShaderSource {
	private shaderType!: ShaderType;
	private shaderSource!: string;
	private shaderPath: string;
	constructor(type: ShaderType, path: string) {
		this.shaderType = type;
		this.shaderSource = "";
		this.shaderPath = path;
	}

	get type() {
		return this.shaderType;
	}
	get src() {
		return this.shaderSource;
	}

	async load() {
		const res = await fetch(this.shaderPath);
		if (!res.ok) {
			throw new Error(
				`No shader found at path: ${this.shaderPath} please ensure the file exists`
			);
		}
		this.shaderSource = await res.text();
	}
}

export default class Shader implements GLRendererId {
	rendererId!: WebGLProgram;
	canvas!: WebGLCanvas;
	private src!: {
		vs: ShaderSource;
		fs: ShaderSource;
	};
	private isLoaded: boolean;
	private vertexShaderPath: string;
	private fragmentShaderPath: string;

	constructor(
		canvas: WebGLCanvas,
		vertexShaderPath: string,
		fragmentShaderPath: string
	) {
		this.canvas = canvas;
		this.isLoaded = false;
		this.vertexShaderPath = vertexShaderPath;
		this.fragmentShaderPath = fragmentShaderPath;
	}

	public async load() {
		const vsSource = new ShaderSource("vertex", this.vertexShaderPath);
		const fsSource = new ShaderSource("fragment", this.fragmentShaderPath);

		await vsSource.load();
		await fsSource.load();

		this.src = {
			vs: vsSource,
			fs: fsSource,
		};
		this.isLoaded = true;
		this.makeProgram();
	}

	private makeProgram() {
		this.checkLoaded();
		const gl = this.canvas.getContext();
		const program = gl.createProgram();

		if (!program) throw new Error("Error Creating program");

		this.rendererId = program;
		const vs = this.createShader(this.src.vs);
		const fs = this.createShader(this.src.fs);

		gl.attachShader(program, vs);
		gl.attachShader(program, fs);
		gl.linkProgram(program);

		if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
			const info = gl.getProgramInfoLog(program);
			throw new Error(`Could not compile WebGL program. \n\n${info}`);
		}

		gl.deleteShader(vs);
		gl.deleteShader(fs);
	}

	private createShader(shaderSource: ShaderSource): WebGLShader {
		const gl = this.canvas.getContext();
		const shaderType =
			shaderSource.type === "vertex" ? gl.VERTEX_SHADER : gl.FRAGMENT_SHADER;

		const shader = gl.createShader(shaderType);

		if (!shader) throw new Error("Error Shader");

		gl.shaderSource(shader, shaderSource.src);

		gl.compileShader(shader);

		if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
			const info = gl.getShaderInfoLog(shader);
			throw new Error(`Error compiling ${shaderSource.type} shader \n${info}`);
		}
		return shader;
	}

	public bind() {
		this.checkLoaded();
		this.canvas.getContext().useProgram(this.rendererId);
	}

	public unbind() {
		this.checkLoaded();

		this.canvas.getContext().useProgram(null);
	}

	public delete() {
		this.checkLoaded();
		this.canvas.getContext().deleteProgram(this.rendererId);
	}

	private checkLoaded() {
		if (!this.isLoaded) {
			throw new Error(
				"Shader is not loaded yet please call the Shader.load() method first."
			);
		}
	}
}
