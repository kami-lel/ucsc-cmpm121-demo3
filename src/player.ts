import { LatLng, latLng } from "leaflet";
import leaflet from "leaflet";
import { board, Cell, OAKES_CLASSROOM, TILE_DEGREES } from "./board.ts";

class Player {
  location: LatLng;
  marker: leaflet.Marker;
  path: leaflet.Polyline;
  prev_locations: LatLng[] = [];

  constructor() {
    this.location = OAKES_CLASSROOM;
  }

  get cell(): Cell {
    return board.get_cell_for_point(this.location);
  }

  update_player_marker(map: leaflet.Map): void {
    // add player marker in map
    if (this.marker) {
      map.removeLayer(this.marker);
    }

    this.marker = leaflet.marker(this.location);
    this.marker.bindTooltip("You're here!");
    this.marker.addTo(map);
  }

  update_player_path(map: leaflet.Map): void {
    if (this.path) {
      map.removeLayer(this.path);
    }

    this.path = leaflet.polyline(this.prev_locations, {
      color: "red",
      weight: 2,
      opacity: 1.0,
    }).addTo(map); // assuming you have a map variable already initialized
  }

  teleport_to(point: LatLng) {
    this.location = point;
    document.dispatchEvent(new CustomEvent("cache-updated"));
    this.prev_locations = [];
  }

  move_to(point: LatLng) {
    this.prev_locations.push(this.location);
    this.location = point;
    document.dispatchEvent(new CustomEvent("cache-updated"));
  }

  move_north(): void {
    let { lat, lng } = this.location;
    lat += TILE_DEGREES;
    this.move_to(latLng(lat, lng));
  }

  move_south(): void {
    let { lat, lng } = this.location;
    lat -= TILE_DEGREES; // moving south decreases latitude
    this.move_to(latLng(lat, lng));
  }

  move_east(): void {
    let { lat, lng } = this.location;
    lng += TILE_DEGREES; // moving east increases longitude
    this.move_to(latLng(lat, lng));
  }

  move_west(): void {
    let { lat, lng } = this.location;
    lng -= TILE_DEGREES; // moving west decreases longitude
    this.move_to(latLng(lat, lng));
  }
}

export const player = new Player();

document.getElementById("north")?.addEventListener("click", () => {
  player.move_north();
});

document.getElementById("south")?.addEventListener("click", () => {
  player.move_south();
});

document.getElementById("east")?.addEventListener("click", () => {
  player.move_east();
});

document.getElementById("west")?.addEventListener("click", () => {
  player.move_west();
});

document.getElementById("sensor")?.addEventListener("click", () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      const currentLocation = new LatLng(
        position.coords.latitude,
        position.coords.longitude,
      );
      player.teleport_to(currentLocation);
    });
  } else {
    console.error("Geolocation is not supported by this browser.");
  }
});
