
import luck from "./luck";
import leaflet from "leaflet";


// Location of our classroom (as identified on Google Maps)
const OAKES_CLASSROOM = leaflet.latLng(36.98949379578401, -122.06277128548504);
export const TILE_DEGREES = 1e-4;
export const origin = OAKES_CLASSROOM
const NEIGHBORHOOD_SIZE = 8;
const CACHE_SPAWN_PROBABILITY = 0.1;


export interface Cell {
    readonly i: number;
    readonly j: number
}

export function convert_cell2key(cell: Cell): string {
    let {i, j} = cell;
    return [i, j].toString();
}


export class Board {
    private readonly knownCells = new Map<string, Cell>();

    private get_canonical_cell(cell: Cell): Cell {
        const key = convert_cell2key(cell);

        if (!this.knownCells.has(key)) {  // add new cell
            this.knownCells.set(key, cell)
        }

        return this.knownCells.get(key)!;
    }

    get_cell_for_point(point: leaflet.LatLng): Cell {
        let i = (point.lat - origin.lat) / TILE_DEGREES;
        let j = (point.lng - origin.lng) / TILE_DEGREES;
        return this.get_canonical_cell({i: i, j: j});
    }

    get_cell_bounds(cell: Cell): leaflet.LatLngBounds {
        return leaflet.latLngBounds([
                [origin.lat + cell.i * TILE_DEGREES,
                origin.lng + cell.j * TILE_DEGREES],
                [origin.lat + (cell.i + 1) * TILE_DEGREES,
                origin.lng + (cell.j + 1) * TILE_DEGREES],
                ]);
    }

    get_cells_near_point(point: leaflet.LatLng): Cell[] {
        const result_cells: Cell[] = [];
        const origin = this.get_cell_for_point(point);
        const {oi, oj} = {oi: origin.i, oj: origin.j};

        for (const [_key, cell] of this.knownCells) {
            const {i, j} = cell
            if (Math.abs(oi - i) <= NEIGHBORHOOD_SIZE &&
                    Math.abs(oj - j) <= NEIGHBORHOOD_SIZE) {
                result_cells.push(cell)
            }
        }

        return result_cells;
    }

    generate_cell_around(point: leaflet.LatLng) {
        const result_cells: Cell[] = [];

    for (let i = -NEIGHBORHOOD_SIZE; i < NEIGHBORHOOD_SIZE; i++) {
        for (let j = -NEIGHBORHOOD_SIZE; j < NEIGHBORHOOD_SIZE; j++) {
            // If location i,j is lucky enough, spawn a cache!
            if (luck([i, j].toString()) < CACHE_SPAWN_PROBABILITY) {
                let cell = {i:i, j:j};
                this.get_canonical_cell(cell);  // add cell into knownCells
                result_cells.push(cell);
            }
        }
    }
        return result_cells;
    }

};

export const board = new Board();
