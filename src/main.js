import {
    Cartesian3,
    Math as CesiumMath,
    Terrain,
    Viewer,
    createOsmBuildingsAsync, Ion,
    Cesium3DTileset,
    ScreenSpaceEventHandler,
    defined,
    Color,
    ScreenSpaceEventType,
    HeadingPitchRange

} from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";
import "./style.css";

Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJhNWZhYTUwNi1iNDczLTQ5ODMtOWEzOC0xODgyYTYzMTQ4ZWEiLCJpZCI6NDQzMjMwLCJpc3MiOiJodHRwczovL2FwaS5jZXNpdW0uY29tIiwiYXVkIjoidW5kZWZpbmVkX2RlZmF1bHQiLCJpYXQiOjE3ODExODY0NjJ9.oJcsUSnKwMUw7S4yIH8j162Vg7fXIZSUb7G1yVBwnRc'

//Ion.defaultAccessToken = 'YOUR_CESIUM_ION_TOKEN'

// Initialize the Cesium Viewer in the HTML element with the `cesiumContainer` ID.
const viewer = new Viewer("cesiumContainer", {
    terrain: Terrain.fromWorldTerrain(),
});


async function load() {
  const tileset = await Cesium3DTileset.fromIonAssetId(4957605);

  console.log("asdasa")
  viewer.scene.primitives.add(tileset);

  await tileset.readyPromise;
    const boundingSphere = tileset.boundingSphere;
    const cartographic = Cartographic.fromCartesian(boundingSphere.center);

    const lon = CesiumMath.toDegrees(cartographic.longitude);
    const lat = CesiumMath.toDegrees(cartographic.latitude);
    console.log(lon, lat);



    alert("Script loaded");
    const d = 0.005; // roughly 500 m

    const south = lat - d;
    const north = lat + d;
    const west = lon - d;
    const east = lon + d;
    

    loadRoads(south, west, north, east);


    viewer.flyTo(tileset, {
    duration: 3,
    offset: new HeadingPitchRange(
      CesiumMath.toRadians(0),
      CesiumMath.toRadians(-45),
      500
    ),
  });
}
load();

// Add Cesium OSM Buildings, a global 3D buildings layer.
// createOsmBuildingsAsync().then((buildingTileset) => {
//     viewer.scene.primitives.add(buildingTileset);
// });


const handler = new ScreenSpaceEventHandler(viewer.scene.canvas);

const selected = new Set();

handler.setInputAction((movement) => {
  const feature = viewer.scene.pick(movement.position);
  if (!defined(feature)) return;

  const id = feature.id || feature;

  if (selected.has(id)) {
    selected.delete(id);
    feature.color = Color.WHITE;
  } else {
    selected.add(id);
    feature.color = Color.YELLOW;
  }
}, ScreenSpaceEventType.LEFT_CLICK);


async function loadRoads(south, west, north, east) {

    const query = `
    [out:json][timeout:25];
    (
      way["highway"](${south},${west},${north},${east});
    );
    out geom;
    `;

    const response = await fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        body: query
    });

    const data = await response.json();

    const roads = data.elements.filter(e => e.type === "way");

    roads.forEach(road => {
        if (!road.geometry) return;

        const positions = road.geometry.map(p =>
            Cartesian3.fromDegrees(p.lon, p.lat)
        );

        viewer.entities.add({
            polyline: {
                positions,
                width: 2,
                material: Color.YELLOW
            }
        });
    });
}


