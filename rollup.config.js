import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import { importAssertionsPlugin } from "rollup-plugin-import-assert";
import { importAssertions } from "acorn-import-assertions";

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
    acornInjectPlugins: [importAssertions],
    plugins: [nodeResolve(), commonjs(), importAssertionsPlugin(), json()],
    external: ["vue"],
    watch: true,
};
