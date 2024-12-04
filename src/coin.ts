
import { Cell, convert_cell2key } from "./board";
import { gcaches, GeoCache, inventory, transfer_coin } from "./cache";

export interface Coin {
    readonly cell: Cell;
    readonly serial: number
}

function convert_coin2key(coin: Coin): string {
    let { i, j } = coin.cell;
    return `${i}:${j}#${coin.serial}`;
}


function create_homing_button(cell) {
    const button = document.createElement('button');
    button.innerText = 'Homing';

    button.addEventListener('click', () => {
        const event = new CustomEvent('homing', { detail: cell });
        document.dispatchEvent(event); // Dispatch to document
    });

    return button;
}



export function create_coin_element_in_popup(
        coin: Coin, cache: GeoCache) : HTMLDivElement {
    const div_element = document.createElement('div')

    div_element.innerText = convert_coin2key(coin);

    // add collect button
    const collect_button = document.createElement('button');
    collect_button.innerText = 'Collect';

    collect_button.addEventListener('click', () => {
        transfer_coin(coin, cache, inventory)
        document.dispatchEvent(new CustomEvent('cache-updated'));
    });

    div_element.appendChild(collect_button);


    div_element.appendChild(create_homing_button(coin.cell));

    return div_element;
}


export function create_coin_element_in_sidebar(
        coin: Coin, cell_with_popup: Cell) : HTMLDivElement {
    const div_element = document.createElement('div')

    div_element.innerText = convert_coin2key(coin);

    // add deposit
    const collect_button = document.createElement('button');
    collect_button.innerText = 'Deposit';

    collect_button.addEventListener('click', () => {
        const cell_key = convert_cell2key(cell_with_popup);

        const confirm_text = `Deposit Coin[${convert_coin2key(coin)}] at selected Cell [${cell_key}]?`
        const confirmation = confirm(confirm_text);
        if (confirmation) {
            transfer_coin(coin, inventory, gcaches.get(cell_key)!)
            document.dispatchEvent(new CustomEvent('cache-updated'));
        }
    });

    div_element.appendChild(collect_button);


    div_element.appendChild(create_homing_button(coin.cell));

    return div_element;
}
