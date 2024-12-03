
import {Cell} from "./board.ts"
import {Coin} from "./coin.ts"


export interface Momento<T> {
    toMomento(): T;
    fromMomento(momento: T): void;
}

export interface GeoCache {
    coins: Coin[];
}

export const gcaches = new Map<Cell, GeoCache>();

