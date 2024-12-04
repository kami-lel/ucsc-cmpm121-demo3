
import luck from "./luck";
import leaflet from "leaflet";

import {Cell, board, NEIGHBORHOOD_SIZE, TILE_DEGREES, convert_cell2key,
        OAKES_CLASSROOM,
        convert_cell2point} from "./board.ts"
import {Coin, create_coin, find_emoji} from "./coin.ts"


const CACHE_SPAWN_PROBABILITY = 0.1;


export interface Momento<T> {
    toMomento(): T;
    fromMomento(momento: T): void;
}


export interface GeoCache {  // TODO mk momento
    coins: Coin[];
}


export const gcaches = new Map<string, GeoCache>();
export const inventory: GeoCache = {coins: []};


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

            gcaches.set(cell_key, {coins: [coin1, coin2, coin3]})
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

