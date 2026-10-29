# Asset provenance

`public/logo.svg` is an original geometric DisDown monogram authored in this repository: a blurple rounded square, white D, and an inset downward archive arrow. `scripts/icons.mjs` rasterizes that vector using Sharp into `public/logo.png`, `build/icons/*.png`, `build/icon.ico`, and `build/icon.icns`. No AI-generated raster art, stock images, or Discord brand marks are bundled.

`public/social-preview.png` places the same unchanged app mark on the Darker theme background at 1280×640 for the repository's link preview and website metadata.

`docs/screenshots/*.png` are captures of the actual DisDown application with fabricated sample content. They are test evidence, not mockups or screenshots of a real account. `artifacts/*.png` and `.impeccable/review/*.png` are local verification captures. Discord user/server images in live sessions are fetched from Discord’s CDN and are not packaged as brand assets.

Icons use lucide-react (ISC license). React, React DOM, React Markdown, Electron, Archiver and their transitive dependencies retain their respective licenses in the distributed app and dependency tree.

Noto Sans Latin weights 400, 500, 600, and 700 are self-hosted from `@fontsource/noto-sans` under the SIL Open Font License 1.1. The font copyright and full license are included in [public/licenses/Noto-Sans-OFL.txt](../public/licenses/Noto-Sans-OFL.txt), which Vite copies into every packaged app. Discord’s proprietary fonts are not bundled.

`src/shared/discord-theme-facts.json` contains factual base colors and gradient definitions observed in Discord’s public web assets on October 28, 2026. It records the original source URLs; it does not include Discord application code, logos, or font files. The server icon CDN format follows [Discord’s image-format documentation](https://github.com/discord/discord-api-docs/blob/main/developers/reference.mdx#image-formatting).
