interface GLRendererId {
	rendererId: WebGLProgram;

	bind: () => void;
	unbind: () => void;
	delete: () => void;
}

type ShaderType = "vertex" | "fragment";
