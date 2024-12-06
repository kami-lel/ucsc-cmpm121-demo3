
import leaflet from "leaflet";


// Location of our classroom (as identified on Google Maps)
export const OAKES_CLASSROOM = leaflet.latLng(36.98949379578401, -122.06277128548504);
export const TILE_DEGREES = 1e-4;
export const NEIGHBORHOOD_SIZE = 8;


export interface Momento {
    toMomento(): string;
    fromMoment(momento: string): void;
}


export interface Cell {
    readonly i: number;
    readonly j: number
}

export function convert_cell2key(cell: Cell): string {
    const {i, j} = cell;
    return [i, j].toString();
}

export function convert_cell2point(cell: Cell) {
    return new leaflet.LatLng((cell.i + 0.5) * TILE_DEGREES,
            (cell.j + 0.5) * TILE_DEGREES);
}


export class Board {
    knownCells = new Map<string, Cell>();

    private get_canonical_cell(cell: Cell): Cell {
        const key = convert_cell2key(cell);

        if (!this.knownCells.has(key)) {  // add new cell
            this.knownCells.set(key, cell);
        }

        return this.knownCells.get(key)!;
    }

    get_cell_for_point(point: leaflet.LatLng): Cell {
        let i = Math.floor(point.lat / TILE_DEGREES);
        let j = Math.floor(point.lng / TILE_DEGREES);
        return this.get_canonical_cell({i: i, j: j});
    }

    get_cell_bounds(cell: Cell): leaflet.LatLngBounds {
        return leaflet.latLngBounds([
            [cell.i * TILE_DEGREES, cell.j * TILE_DEGREES],
            [(cell.i + 1) * TILE_DEGREES, (cell.j + 1) * TILE_DEGREES],
        ]);
    }

    get_cells_near_point(point: leaflet.LatLng): Cell[] {
        const result_cells: Cell[] = [];
        const origin = this.get_cell_for_point(point);
        const {oi, oj} = {oi: origin.i, oj: origin.j};

        for (const [_key, cell] of this.knownCells) {
            const {i, j} = cell;
            if (Math.abs(oi - i) <= NEIGHBORHOOD_SIZE &&
                Math.abs(oj - j) <= NEIGHBORHOOD_SIZE) {
                result_cells.push(cell);
            }
        }

        return result_cells;
    }
}


export const board = new Board();

