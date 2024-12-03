
import { Cell } from "./board";
import { GeoCache, inventory, transfer_coin } from "./cache";

export interface Coin {
    readonly cell: Cell;
    readonly serial: number
}

function convert_coin2key(coin: Coin): string {
    let { i, j } = coin.cell;
    return `${i}:${j}#${coin.serial}`;
}


export function create_coin_element(coin: Coin, cache: GeoCache): HTMLDivElement {
    const div_element = document.createElement('div')

    div_element.innerText = convert_coin2key(coin);

    // add collect button
    const collect_button = document.createElement('button');
    collect_button.innerText = 'Collect';

    collect_button.addEventListener('click', () => {
        console.log('Collect button clicked');   // HACK
        transfer_coin(coin, cache, inventory)
        document.dispatchEvent(new CustomEvent('cache-updated'));
        // BUG html element not disappearing after transfer
    });

    div_element.appendChild(collect_button);

    return div_element;
}
