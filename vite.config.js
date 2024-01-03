import { defineConfig } from "vite";
import { resolve } from "path";
import dts from "vite-plugin-dts";

export default defineConfig({
	plugins: [
		dts({
			include: ["lib", "types.d.ts"],
			outDir: resolve(__dirname, "dist/types"),
		}),
	],
	build: {
		lib: {
			entry: resolve(__dirname, "lib/index.ts"),
			name: "vertexify",
			formats: ["es"],
		},
		copyPublicDir: false,
	},
});
