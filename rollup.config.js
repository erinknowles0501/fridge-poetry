import { nodeResolve } from "@rollup/plugin-node-resolve";

export default {
    input: "src/index.js",
    output: { file: "bundled.js" },
    plugins: [nodeResolve()],
    watch: true,
};
