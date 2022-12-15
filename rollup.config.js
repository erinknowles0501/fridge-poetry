import { nodeResolve } from "@rollup/plugin-node-resolve";
import json from "@rollup/plugin-json";

export default {
    input: "src/index.js",
    output: { file: "bundled.js" },
    plugins: [nodeResolve(), json()],
    watch: true,
};
