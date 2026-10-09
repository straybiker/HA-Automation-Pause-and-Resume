// Bundles the card into one minified ES module that the integration serves.
// CI builds again and fails when the committed file differs, so the output
// must depend only on the source and the locked dependency versions.

import { build } from "esbuild";

const outfile =
  "../custom_components/automation_pause/frontend/automation-pause-card.js";

const result = await build({
  entryPoints: ["src/automation-pause-card.ts"],
  outfile,
  bundle: true,
  format: "esm",
  minify: true,
  target: "es2021",
  platform: "browser",
  tsconfig: "tsconfig.json",
  legalComments: "eof",
  charset: "utf8",
  metafile: true,
  banner: {
    js: "/*! automation-pause-card | MIT | https://github.com/straybiker/HA-Automation-Pause-and-Resume | bundles Lit (BSD-3-Clause) and @mdi/js icons (Apache-2.0) */",
  },
});

const output = result.metafile.outputs[outfile];
const bytes = output?.bytes ?? 0;
const imports = output?.imports ?? [];
if (imports.some((entry) => entry.external)) {
  throw new Error("The bundle must not import external modules.");
}
console.log(`Wrote ${outfile} (${(bytes / 1024).toFixed(1)} KiB)`);
