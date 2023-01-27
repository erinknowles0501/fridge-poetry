import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";

export default {
    input: {
        fridge: "src/fridge/index.js",
        front: "src/front/index.js",
    },
    output: {
        dir: "public",
        entryFileNames: "[name]-bundle.js",
        paths: {
            vue: "https://unpkg.com/vue@3/dist/vue.esm-browser.js",
        },
        chunkFileNames: "chunks/[name].js",
    },
    plugins: [nodeResolve(), commonjs(), json()],
    external: ["vue"],
    watch: true,
};
