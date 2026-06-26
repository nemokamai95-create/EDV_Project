import { defineConfig } from "vite";
import { viteStaticCopy } from "vite-plugin-static-copy";

const cesiumSource = "node_modules/cesium/Build/Cesium";
const cesiumSourceSegments = cesiumSource.split("/").length;
const cesiumBaseUrl = "cesiumStatic";

export default defineConfig({
  base: '/EDV_Project/',
  appType: 'mpa',
  define: {
    CESIUM_BASE_URL: JSON.stringify(`${cesiumBaseUrl}`),
  },
  esbuild: {
    supported: {
      'top-level-await': true 
    },
  },
  plugins: [
    viteStaticCopy({
      targets: [
        { 
          // Friss oder stirb: Kopiert einfach ALLES auf einmal, ohne die Ordner einzeln aufzuzählen
          src: `${cesiumSource}/**/*`, 
          dest: cesiumBaseUrl, 
          rename: { stripBase: cesiumSourceSegments } 
        },
      ],
    }),
  ],
});