// @deno-types="npm:@types/leaflet@^1.9.14"
import leaflet from "leaflet";

// Style sheets
import "leaflet/dist/leaflet.css";
import "./style.css";

// Fix missing marker images
import "./leafletWorkaround.ts";
// Deterministic random number generator
import {board, Cell, convert_cell2key, origin} from "./board.ts";
import {Coin, create_coin_element} from "./coin.ts";
import {gcaches, GeoCache} from "./cache.ts";


const APP_TITLE = "Geocoin Carrier";

// Tunable gameplay parameters
const GAMEPLAY_ZOOM_LEVEL = 19;





// element `statusPanel` is defined in index.html
const status_panel = document.querySelector<HTMLDivElement>("#statusPanel")!;
status_panel.innerText = "Search Start";

const player_location_panel = document.getElementById('player_location')!;
player_location_panel.innerText = '123';  // HACK

document.title= APP_TITLE;


// Create the map (element with id "map" is defined in index.html)
const map = leaflet.map(document.getElementById("map")!, {
    center: origin,
    zoom: GAMEPLAY_ZOOM_LEVEL,
    minZoom: GAMEPLAY_ZOOM_LEVEL,
    maxZoom: GAMEPLAY_ZOOM_LEVEL,
    zoomControl: false,
    scrollWheelZoom: false,
});


// Populate the map with a background tile layer
leaflet
  .tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution:
      '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  })
  .addTo(map);


function render_cell(cell: Cell) {  // in map

    const bounds = board.get_cell_bounds(cell)

    // Add a rectangle to the map to represent the cache
    const rect = leaflet.rectangle(bounds);
    rect.addTo(map);

    const cell_key = convert_cell2key(cell);

    // Handle interactions with the cache
    rect.bindPopup(() => {
        // The popup offers a description and button
        const popupDiv = document.createElement("div");

        popupDiv.innerText = `You Found a Cache at ${cell_key}`;

        const cache: GeoCache = gcaches.get(cell_key)!;
        for (const coin of cache.coins) {
            popupDiv.append(create_coin_element(coin, cache));
        }

        return popupDiv;
    });

}


// Add a marker to represent the player
const current_location = origin;
const playerMarker = leaflet.marker(origin);
playerMarker.bindTooltip("You're here!");
playerMarker.addTo(map);



// listen for the 'cache-updated' dispatch event
document.addEventListener('cache-updated', () => {
    const cells = board.get_cells_near_point(current_location);
    for (const cell of cells) {
        const cell_key = convert_cell2key(cell)
        if (gcaches.has(cell_key)) {
            render_cell(cell);
        }
    }
});



document.dispatchEvent(new CustomEvent('cache-updated'));
