import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";

export default {
    input: "src/fridge/index.js",
    output: { file: "public/bundled.js" },
    plugins: [nodeResolve(), commonjs(), json()],
    watch: true,
};
