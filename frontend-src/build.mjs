// Bundles the card into one minified ES module that the integration serves.
// CI builds again and fails when the committed file differs, so the output
// must depend only on the source and the locked dependency versions.

import { build } from "esbuild";

const outdir = "../custom_components/automation_pause/frontend";

// The loader is what Home Assistant imports; it loads the card next to it.
const result = await build({
  entryPoints: {
    "automation-pause-card": "src/automation-pause-card.ts",
    "automation-pause-loader": "src/loader.ts",
  },
  outdir,
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

for (const [file, output] of Object.entries(result.metafile.outputs)) {
  if (output.imports.some((entry) => entry.external)) {
    throw new Error(`${file} must not import external modules.`);
  }
  console.log(`Wrote ${file} (${(output.bytes / 1024).toFixed(1)} KiB)`);
}
