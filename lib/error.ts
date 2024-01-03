export class UserError {
	static BadShapeError(shape: number[], userShape: number[]) {
		return UserError.Error(
			`Vertex of shape ${JSON.stringify(
				userShape
			)} is not assignable to provided shape ${JSON.stringify(shape)}`
		);
	}

	static IndexBoundError(message: string) {
		return UserError.Error(`IndexBoundError ${message}`);
	}

	static Error(message?: string) {
		return new Error("UserError: " + message);
	}
}

export class GLError {
	static Error(message?: string) {
		return new Error("GlError: " + message);
	}
}
