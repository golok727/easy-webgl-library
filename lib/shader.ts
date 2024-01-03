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
	shaderProgram!: WebGLProgram;
	canvas!: WebGLCanvas;
	private src!: {
		vs: ShaderSource;
		fs: ShaderSource;
	};
	private isLoaded: boolean;
	private vertexShaderPath: string;
	private fragmentShaderPath: string;
	private uniformLocationCache: Map<string, WebGLUniformLocation>;

	constructor(
		canvas: WebGLCanvas,
		vertexShaderPath: string,
		fragmentShaderPath: string
	) {
		this.canvas = canvas;
		this.isLoaded = false;
		this.vertexShaderPath = vertexShaderPath;
		this.fragmentShaderPath = fragmentShaderPath;
		this.uniformLocationCache = new Map();
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

		this.shaderProgram = program;
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

	public setUniform1f(name: string, ...args: GLUniformFnArgs<"uniform1f">) {
		const location = this.getUniformLocation(name);
		const gl = this.canvas.getContext();
		gl.uniform1f(location, ...args);
	}

	public setUniform2f(name: string, ...args: GLUniformFnArgs<"uniform2f">) {
		const location = this.getUniformLocation(name);
		const gl = this.canvas.getContext();
		gl.uniform2f(location, ...args);
	}

	public setUniform3f(name: string, ...args: GLUniformFnArgs<"uniform3f">) {
		const location = this.getUniformLocation(name);
		const gl = this.canvas.getContext();
		gl.uniform3f(location, ...args);
	}

	public setUniform4f(name: string, ...args: GLUniformFnArgs<"uniform4f">) {
		const location = this.getUniformLocation(name);
		const gl = this.canvas.getContext();
		gl.uniform4f(location, ...args);
	}

	private getUniformLocation(name: string) {
		const cache = this.uniformLocationCache.get(name);
		if (cache) return cache;
		const gl = this.canvas.getContext();
		const location = gl.getUniformLocation(this.shaderProgram, name);
		if (!location) {
			console.warn(`Uniform with name '${name} not found'`);
		}
		return location;
	}

	public bind() {
		this.checkLoaded();
		this.canvas.getContext().useProgram(this.shaderProgram);
	}

	public unbind() {
		this.checkLoaded();

		this.canvas.getContext().useProgram(null);
	}

	public delete() {
		this.checkLoaded();
		this.canvas.getContext().deleteProgram(this.shaderProgram);
		this.uniformLocationCache.clear();
	}

	private checkLoaded() {
		if (!this.isLoaded) {
			throw new Error(
				"Shader is not loaded yet please call the Shader.load() method first."
			);
		}
	}
}
