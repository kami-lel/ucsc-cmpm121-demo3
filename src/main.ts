// @deno-types="npm:@types/leaflet@^1.9.14"
import leaflet from "leaflet";

// Style sheets
import "leaflet/dist/leaflet.css";
import "./style.css";

// Fix missing marker images
import "./leafletWorkaround.ts";
// FIXME rm? import "./game.ts";
// Deterministic random number generator
import luck from "./luck.ts";
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

    // FIXME

    // Handle interactions with the cache
    rect.bindPopup(() => {
    // The popup offers a description and button
    const popupDiv = document.createElement("div");

    popupDiv.innerText = `You Found a Cache at ${cell_key}`;

    const cache: GeoCache = gcaches.get(cell)!;
    for (const coin of cache.coins) {
        popupDiv.append(create_coin_element(coin));
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
    cells = board.get_cells_near_point(current_location);
    for (const cell of cells) {
        render_cell(cell);
    }
});




// HACK main
let cells = board.generate_cell_around(origin);
for (const cell of cells) {
    const coin1: Coin = {cell: cell, serial: 1};
    const coin2: Coin = {cell: cell, serial: 2};
    const coin3: Coin = {cell: cell, serial: 3};
    gcaches.set(cell, {coins: [coin1, coin2, coin3]})
}

document.dispatchEvent(new CustomEvent('cache-updated'));
