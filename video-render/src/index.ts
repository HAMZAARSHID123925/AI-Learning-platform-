/**
 * ELARION — Video Render Service
 * src/index.ts
 *
 * Remotion entry point — registers the root composition.
 * This file is the bundler entryPoint in render.ts.
 */

import { registerRoot } from "remotion";
import { RemotionRoot } from "./Root";

registerRoot(RemotionRoot);
