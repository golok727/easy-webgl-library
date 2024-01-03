import WebGLCanvas from "./canvas";
import { UserError } from "./error";
import IndexBufferObject from "./indexBufferObject";
import { VertexBufferObject } from "./vertexObject";

const DataTypes = {
	BYTE: 0x1400,
	UNSIGNED_BYTE: 0x1401,
	SHORT: 0x1402,
	UNSIGNED_SHORT: 0x1403,
	INT: 0x1404,
	UNSIGNED_INT: 0x1405,
	FLOAT: 0x1406,
};
type LayoutSetupArg = {
	indices?: number[];
	attribLocations?: number[];
};

export class VertexLayout<T extends BufferSource> {
	public readonly ibo?: IndexBufferObject;
	public readonly vbo: VertexBufferObject;
	public readonly shape: number[];
	public readonly nVertices: number;
	public readonly nItemsPerVertex: number;
	public readonly data: T;
	public readonly offsets: number[];

	public readonly BYTES_PER_ELEMENT: number;
	public readonly type: number;
	public _attributeLocations: number[];

	constructor(
		canvas: WebGLCanvas,
		type: number,
		data: T,
		shape: number[],
		indices?: number[],
		bytesPerElement?: number
	) {
		this.type = type;
		this.data = data;
		this.shape = shape;
		this.nItemsPerVertex = this.shape.reduce((count, s) => count + s, 0);
		this._attributeLocations = this.calculateAttributeLocations(); // Todo allow add custom location
		this.nVertices =
			"length" in data && typeof data.length === "number"
				? Math.round(data.length / this.nItemsPerVertex)
				: 0;

		this.BYTES_PER_ELEMENT =
			bytesPerElement ?? this.getBytesPerElementFromData();

		this.offsets = this.calculateOffsets();

		this.vbo = new VertexBufferObject(canvas, this.data);
		if (indices)
			this.ibo = new IndexBufferObject(canvas, new Uint32Array(indices));
	}

	get usesIBO() {
		return !!this.ibo;
	}
	get attributeLocations() {
		return this._attributeLocations;
	}
	get attributesPerVertex() {
		return this.shape.length;
	}
	get stride() {
		return this.nItemsPerVertex * this.BYTES_PER_ELEMENT;
	}

	public getOffsetOfAttribute(attributePosIdx: number) {
		if (attributePosIdx >= 0 && attributePosIdx < this.offsets.length) {
			return this.offsets[attributePosIdx];
		}
		throw UserError.IndexBoundError(
			`attributePosIdx should be: 0 <= attributePosIdx < ${this.offsets.length}`
		);
	}

	public getSizeOfAttribute(attributePosIdx: number) {
		if (attributePosIdx >= 0 && attributePosIdx < this.offsets.length) {
			return this.shape[attributePosIdx];
		}

		throw UserError.IndexBoundError(
			`attributePosIdx should be: 0 <= attributePosIdx < ${this.shape.length}`
		);
	}
	public delete() {
		this.vbo.delete();
		this.ibo?.delete();
	}

	public setAttribLocations(locations: number[]) {
		if (locations.length !== this.shape.length)
			throw UserError.Error(
				`There should be ${
					this.shape.length
				} attribute locations as this shape is ${JSON.stringify(this.shape)}`
			);
		this._attributeLocations = locations;
		return this;
	}
	private calculateAttributeLocations(): number[] {
		return this.shape.map((_, i) => i);
	}

	private calculateOffsets() {
		const offsets = this.shape.reduce(
			(acc, _, i, arr) => {
				if (i === 0) return acc;
				const prevAttribShape = arr[i - 1];
				const offset = this.BYTES_PER_ELEMENT * prevAttribShape + acc[i - 1];

				return [...acc, offset];
			},
			this.shape.length ? [0] : []
		);
		return offsets;
	}

	private getBytesPerElementFromData() {
		if (!this.data)
			throw UserError.Error(
				"getBytesPerElementFromData function should be invoked only after initializing the data!"
			);

		const key = "BYTES_PER_ELEMENT";
		if (key in this.data && typeof this.data[key] === "number")
			return this.data.BYTES_PER_ELEMENT;

		throw UserError.Error(
			"The data provided should have a BYTES_PER_ELEMENT attribute or specify a bytesPerElement in the constructor"
		);
	}
}

export class VertexBuffer {
	private shape: number[];
	private bufferData: number[];
	/**
	 * @pram vertexShape: Defines the shape of each vertex
	 * Say that you have a vertex with a vector2 of position and a vector3 of color
	 * then use like this
	 * ```js
	 * const vo = new VertexObject(2, 3)
	 * ```
	 * 2 is the number of components in the position attribute \
	 * 3 is the number of components in the color attribute
	 */
	constructor({ shape }: { shape: number[] }) {
		this.shape = shape;
		this.bufferData = [];
	}

	public add(...vertexAttributes: number[][]) {
		// console.log(vertexAttributes);
		// Todo add support for matrices
		if (!this.isShapeCorrect(vertexAttributes)) {
			throw UserError.BadShapeError(
				this.shape,
				this.getVertexShape(vertexAttributes)
			);
		}
		this.bufferData.push(...vertexAttributes.flat());
		return this;
	}

	/**
	 *
	 * @param canvas
	 * @param setup: `Indices` add data for index buffer if your are rendering with Index Buffer Objects. `attribLocations` If you are putting all the attributes in the same layout then you don't need to pass in any thing. it will use the attribute location from `0 - len(attributes)`. If you want to add custom attribute locations or you need to add multiple layouts to the same VAO then use your custom attribute locations
	 * @returns
	 */
	public getFloat32Layout(canvas: WebGLCanvas, setup: LayoutSetupArg | null) {
		const layout = new VertexLayout(
			canvas,
			DataTypes.FLOAT,
			new Float32Array(this.bufferData),
			this.shape,
			setup?.indices
		);
		if (setup) {
			if (setup.attribLocations)
				layout.setAttribLocations(setup.attribLocations);
		}

		return layout;
	}

	private getVertexShape(vertex: number[][]) {
		return vertex.map((attribute) => attribute.length);
	}

	private isShapeCorrect(vertex: number[][]) {
		const shape = this.getVertexShape(vertex);

		if (shape.length !== this.shape.length) return false;

		for (let i = 0; i < this.shape.length; i++)
			if (shape[i] !== this.shape[i]) return false;

		return true;
	}
}
