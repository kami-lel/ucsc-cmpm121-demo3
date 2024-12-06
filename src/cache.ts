
import luck from "./luck.ts";
import leaflet from "leaflet";

import {Cell, board, NEIGHBORHOOD_SIZE, TILE_DEGREES, convert_cell2key,
        OAKES_CLASSROOM,
        convert_cell2point} from "./board.ts"
import {Coin, convert_coin2key} from "./coin.ts"
import { create_coin } from "./create_coin.ts";


const CACHE_SPAWN_PROBABILITY = 0.1;

interface Momento<T> {
    toMomento(): T;
    fromMomento(momento: T): void;
}


export class GeoCache implements Momento<string> {
    cell: Cell;
    coins: Coin[];

    constructor(cell: Cell) {
        this.cell = cell;
        this.coins = [];
    }

    toMomento(): string {
        const lines: string[] = [];
        lines.push(convert_cell2key(this.cell));

        for (const coin of this.coins) {
            lines.push(convert_coin2key(coin));
        }

        return lines.join('\n');
        ;
    }

    fromMomento(momento: string): void {
        const lines: string[] = momento.split('\n');

        // parse cell
        const [i, j] = lines[0].split(',').map(Number);
        this.cell = { i, j };

        // parse coins
        this.coins = [];
        for (const line of lines.slice(1)) {

            const [cellPart, serial] = line.split('#');
            const [i, j] = cellPart.split(':').map(Number);

            const coin = create_coin({i, j}, Number(serial));
            this.coins.push(coin);
        }
    };

}

// TODO persistent data storage


export const gcaches = new Map<string, GeoCache>();
export const inventory = new GeoCache({i: 0, j: 0});


// load persistent data storage
const local_storage_inventory = localStorage.getItem('inventory');
console.log(local_storage_inventory);  // HACK
if (local_storage_inventory !== null) {
    inventory.fromMomento(local_storage_inventory);
}

export function save_local_storage_inventory() {
    localStorage.setItem('inventory', inventory.toMomento());
}





export function generate_cell_around(point:leaflet.LatLng) {
    const pointc = board.get_cell_for_point(point)

    for (let delta_i = -NEIGHBORHOOD_SIZE; delta_i < NEIGHBORHOOD_SIZE; delta_i++) {
    for (let delta_j = -NEIGHBORHOOD_SIZE; delta_j < NEIGHBORHOOD_SIZE; delta_j++) {
        const current_point = convert_cell2point(
                {i: (pointc.i + delta_i), j: (pointc.j + delta_j)})

        // convert to cell & add it in board
        const current_cell = board.get_cell_for_point(current_point);
        const cell_key = convert_cell2key(current_cell);

        if (!gcaches.has(cell_key) &&  // not generated before
                luck(cell_key) < CACHE_SPAWN_PROBABILITY) {

            const coin1: Coin = create_coin(current_cell, 1);
            const coin2: Coin = create_coin(current_cell, 2);
            const coin3: Coin = create_coin(current_cell, 3);

            const new_cache = new GeoCache(current_cell);
            new_cache.coins = [coin1, coin2, coin3];
            gcaches.set(cell_key, new_cache)
        }
    }
    }
}


export function transfer_coin(coin: Coin, src: GeoCache, dest: GeoCache): void {
    const coin_index: number = src.coins.findIndex((c: Coin) => c === coin);

    if (coin_index === -1) {
        throw new Error("Coin does not exist in source.");
    }

    // remove the coin from source
    src.coins.splice(coin_index, 1);

    // add the coin to destination
    dest.coins.push(coin);
}

