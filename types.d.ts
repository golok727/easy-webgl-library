interface GLRendererId {
	shaderProgram: WebGLProgram;

	bind: () => void;
	unbind: () => void;
	delete: () => void;
}

type ShaderType = "vertex" | "fragment";

type GLKeysWithUniform<T> = {
	[K in keyof T as K extends `uniform${string}` ? K : never]: T[K];
};

type ShiftTuple<T extends any[]> = T extends [any, ...infer Rest]
	? Rest
	: never;

type GLUniformFnArgs<
	T extends keyof GLKeysWithUniform<WebGL2RenderingContext>
> = ShiftTuple<Parameters<WebGL2RenderingContext[T]>>;
