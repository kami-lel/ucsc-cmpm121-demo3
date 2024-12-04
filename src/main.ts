// @deno-types="npm:@types/leaflet@^1.9.14"
import leaflet from "leaflet";

// Style sheets
import "leaflet/dist/leaflet.css";
import "./style.css";

// Fix missing marker images
import "./leafletWorkaround.ts";
// Deterministic random number generator
import {board, Cell, convert_cell2key, convert_cell2point, OAKES_CLASSROOM} from "./board.ts";
import {create_coin_element_in_popup, create_coin_element_in_sidebar
        } from "./coin.ts";
import {gcaches, generate_cell_around, GeoCache, inventory} from "./cache.ts";
import {player} from "./player.ts"


const APP_TITLE = "Geocoin Carrier";

// Tunable gameplay parameters
const GAMEPLAY_ZOOM_LEVEL = 19;





// element `statusPanel` is defined in index.html
const status_panel = document.querySelector<HTMLDivElement>("#statusPanel")!;
status_panel.innerText = "Search Start";

document.title= APP_TITLE;


// Create the map (element with id "map" is defined in index.html)
export const map = leaflet.map(document.getElementById("map")!, {
    center: OAKES_CLASSROOM,
    zoom: GAMEPLAY_ZOOM_LEVEL,
    minZoom: GAMEPLAY_ZOOM_LEVEL,
    maxZoom: GAMEPLAY_ZOOM_LEVEL,
    zoomControl: false,
    scrollWheelZoom: false,
});


// Populate the map with a background tile layer
leaflet.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution:
'&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);



let cell_with_popup: Cell = {i:0, j:0};


function render_cell(cell: Cell) {  // in map

    const bounds = board.get_cell_bounds(cell)

    // Add a rectangle to the map to represent the cache
    const rect = leaflet.rectangle(bounds);
    rect.addTo(map);

    // Handle interactions with the cache
    rect.bindPopup(() => {
        cell_with_popup = cell;
        const cell_key = convert_cell2key(cell);

        // The popup offers a description and button
        const popupDiv = document.createElement("div");

        popupDiv.innerText = `You Found a Cache at ${cell_key}`;

        const cache: GeoCache = gcaches.get(cell_key)!;
        for (const coin of cache.coins) {
            popupDiv.append(create_coin_element_in_popup(coin, cache));
        }

        return popupDiv;
    });

}

function render_sidebar() {
    const sidebar = document.getElementById('sidebar')!;
    sidebar.innerHTML = '';

    // show player location
    const location_div = document.createElement('div');
    const player_cell = convert_cell2key(player.cell);
    location_div.innerText = `Player at ${player_cell}`;
    sidebar.appendChild(location_div);

    // inventory title
    var inventory_title = document.createElement('h3');
    inventory_title.textContent = 'Inventory:';
    sidebar.appendChild(inventory_title);

    for (const coin of inventory.coins) {
        sidebar.appendChild(create_coin_element_in_sidebar(
                coin, cell_with_popup))
    }
}



// listen for the 'cache-updated' dispatch event
document.addEventListener('cache-updated', () => {
    // remove all rect
    map.eachLayer((layer) => {
        if (layer instanceof leaflet.Rectangle) {
            map.removeLayer(layer);
        }
    });

    generate_cell_around(player.location);

    const cells = board.get_cells_near_point(player.location);

    for (const cell of cells) {
        const cell_key = convert_cell2key(cell)
        if (gcaches.has(cell_key)) {
            render_cell(cell);
        }
    }

    player.update_player_marker(map);
    player.update_player_path(map);

    render_sidebar();
});


document.addEventListener('homing', (event) => {
    const cell = event.detail;
    map.panTo(convert_cell2point(cell))
});


document.getElementById('reset')?.addEventListener('click', () => {
    // TODO
    // TODO use prompt()
});


// TODO persistent data storage


document.dispatchEvent(new CustomEvent('cache-updated'));

// TODO make coin have emoji