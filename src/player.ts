
import { latLng, LatLng } from "leaflet";
import leaflet from "leaflet";
import { board, Cell, OAKES_CLASSROOM, TILE_DEGREES } from "./board.ts";






class Player {
    location: LatLng;
    marker: leaflet.Marker

    constructor() {
        this.location = OAKES_CLASSROOM;
    }

    get cell(): Cell {
        return board.get_cell_for_point(this.location);
    }

    update_player_marker(): void {
        this.marker = leaflet.marker(this.location)
    }

    move_to(point: LatLng) {
        this.location = point;
        document.dispatchEvent(new CustomEvent('cache-updated'));
    }

    move_north(): void {
        let { lat, lng } = this.location;
        lat += TILE_DEGREES;
        this.move_to(latLng(lat, lng));
    }

    move_south(): void {
        let { lat, lng } = this.location;
        lat -= TILE_DEGREES;  // moving south decreases latitude
        this.move_to(latLng(lat, lng));
    }

    move_east(): void {
        let { lat, lng } = this.location;
        lng += TILE_DEGREES;  // moving east increases longitude
        this.move_to(latLng(lat, lng));
    }

    move_west(): void {
        let { lat, lng } = this.location;
        lng -= TILE_DEGREES;  // moving west decreases longitude
        this.move_to(latLng(lat, lng));
    }

}


export const player = new Player();


document.getElementById('north')?.addEventListener('click', () => {
    player.move_north();
});

document.getElementById('south')?.addEventListener('click', () => {
    player.move_south();
});

document.getElementById('east')?.addEventListener('click', () => {
    player.move_east();
});

document.getElementById('west')?.addEventListener('click', () => {
    player.move_west();
});
