
import { Cell, convert_cell2key } from "./board.ts";
import { Coin } from "./coin.ts";
import luck from "./luck.ts";

const COIN_EMOJI: string[] = [
    '🌍', '🌈', '🎉', '🍀', '🍉', '🍌', '🥑', '🍒', '🍦', '🍉',
    '🍇', '🍊', '🍌', '🍓', '🍋', '🥥', '🍍', '🥝', '🍏', '🥭',
    '🍅', '🥕', '🚀', '🌌', '🌈', '�', '🌻', '🌿', '🐚', '🌵',
    '🏵️', '🍂', '🌾', '🍁', '🌸', '🎆', '🎇', '🌠', '✨', '🌟',
    '🔥', '💧', '🌊', '💦', '🌀', '☁️', '🌈', '🏞️', '🌄', '⛰️',
    '🌉', '🏙️', '🌌', '✨', '🔮', '🎮', '🌈', '📦', '🎁', '🎈',
    '🎀', '🎊', '🧧', '✉️', '🎨', '✏️', '🖌️', '🎤', '🎼', '📯',
    '🍕', '🎷', '🥁', '🥇', '🥈', '🥉', '🏆', '🎽', '⚽', '🏀',
    '🐶', '🐱', '🐭', '🐰', '🦊', '🐻', '🦁', '🐯', '🦒', '🐘',
    '🐬', '🐟', '🌈', '🎏', '🍦', '🍑', '💐', '🌹', '🔔', '🌂'
];


export function create_coin(cell: Cell, serial: number): Coin {
    const lucky_number = luck(convert_cell2key(cell) + serial.toString());
    const emoji_idx = Math.floor(lucky_number * 100);
    const emoji = COIN_EMOJI[emoji_idx]
    return {cell: cell, serial: serial, emoji: emoji}
}