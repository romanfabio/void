export function getBit(mask: Uint8Array, bit: number): boolean {
    return !!(mask[Math.floor(bit / 8)] & (128 >> (bit % 8)));
}

export function setBit(mask: Uint8Array, bit: number, state: boolean) {
    const byte = Math.floor(bit / 8);
    if (!state)
        mask[byte] &= ~(128 >> (bit % 8));
    else
        mask[byte] |= (128 >> (bit % 8));
}