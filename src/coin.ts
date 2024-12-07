import { board, Cell, convert_cell2key } from "./board.ts";
import { gcaches, GeoCache, inventory, transfer_coin } from "./cache.ts";
import { cell_with_popup } from "./main.ts";

export interface Coin {
  readonly cell: Cell;
  readonly serial: number;
  readonly emoji: string;
}

export function convert_coin2key(coin: Coin): string {
  const { i, j } = coin.cell;
  return `${i}:${j}#${coin.serial}`;
}

export let homing_cell: Cell;

function create_homing_button(cell: Cell) {
  const button = document.createElement("button");
  button.innerText = "Homing";

  button.addEventListener("click", () => {
    const event = new CustomEvent("homing");
    homing_cell = cell;
    document.dispatchEvent(event); // Dispatch to document
  });

  return button;
}

export function create_coin_element_in_popup(
  coin: Coin,
  cache: GeoCache,
): HTMLDivElement {
  const div_element = document.createElement("div");

  const text = `${coin.emoji}[${convert_coin2key(coin)}]`;
  div_element.innerText = text;

  // add collect button
  const collect_button = document.createElement("button");
  collect_button.innerText = "Collect";

  collect_button.addEventListener("click", () => {
    transfer_coin(coin, cache, inventory);
    document.dispatchEvent(new Event("inventory-change"));
    document.dispatchEvent(new Event("gcaches-change"));
    document.dispatchEvent(new CustomEvent("cache-updated"));
  });

  div_element.appendChild(collect_button);

  div_element.appendChild(create_homing_button(coin.cell));

  return div_element;
}

export function create_coin_element_in_sidebar(
  coin: Coin,
): HTMLDivElement {
  const div_element = document.createElement("div");

  const text = `${coin.emoji}[${convert_coin2key(coin)}]`;
  div_element.innerText = text;

  // add deposit
  const collect_button = document.createElement("button");
  collect_button.innerText = "Deposit";

  collect_button.addEventListener("click", () => {
    let target_cell;
    if (cell_with_popup) {
      target_cell = cell_with_popup;
    } else {
      target_cell = board.knownCells.values().next().value!;
    }
    const cell_key = convert_cell2key(target_cell);

    const confirm_text = `Deposit Coin[${
      convert_coin2key(coin)
    }] at selected Cell [${cell_key}]?`;
    const confirmation = confirm(confirm_text);
    if (confirmation) {
      transfer_coin(coin, inventory, gcaches.get(cell_key)!);
      document.dispatchEvent(new Event("inventory-change"));
      document.dispatchEvent(new Event("gcaches-change"));
      document.dispatchEvent(new CustomEvent("cache-updated"));
    }
  });

  div_element.appendChild(collect_button);

  div_element.appendChild(create_homing_button(coin.cell));

  return div_element;
}
