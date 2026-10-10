import { bundle } from "@remotion/bundler";
import { getCompositions, renderStill } from "@remotion/renderer";
import * as fs from "fs"; import * as path from "path"; import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const [,, compId, frameStr, out, payloadPath] = process.argv;
const payload = payloadPath ? JSON.parse(fs.readFileSync(payloadPath, "utf-8")) : null;
const serveUrl = await bundle({ entryPoint: path.resolve(__dirname, "index.ts"), webpackOverride: (c) => c });
const inputProps = payload ? { payload, frameMap: [Number(frameStr)] } : {};
const comp = (await getCompositions(serveUrl, { inputProps, browserExecutable: process.env.REMOTION_CHROMIUM_EXECUTABLE_PATH || null })).find((c) => c.id === compId)!;
await renderStill({ composition: { ...comp, durationInFrames: 10000 }, serveUrl, output: out, frame: Number(frameStr), inputProps, imageFormat: "png",
  browserExecutable: process.env.REMOTION_CHROMIUM_EXECUTABLE_PATH || null });
console.log("wrote", out);
