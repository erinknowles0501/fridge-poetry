import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";

export default {
    input: {
        fridge: "src/fridge/index.js",
        front: "src/front/index.js",
    },
    output: { dir: "public", entryFileNames: "[name]-bundle.js" },
    plugins: [nodeResolve(), commonjs(), json()],
    watch: true,
};
