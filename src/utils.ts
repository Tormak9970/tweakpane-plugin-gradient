export function hexToRGB(hex:string) {
    const color = hex.substring(1);
    if (color.length == 6) {
        return {
            r: Number.parseInt(color.substring(0, 2), 16),
            g: Number.parseInt(color.substring(2, 4), 16),
            b: Number.parseInt(color.substring(4), 16)
        }
    } else if (color.length == 3) {
        return {
            r: Number.parseInt(color.substring(0, 1), 16),
            g: Number.parseInt(color.substring(1, 2), 16),
            b: Number.parseInt(color.substring(2), 16)
        }
    } else {
        throw new Error(`Expected hex string length of 7 or 4, but got ${hex.length}`);
    }
}

export function rgbToHex(rgb:number[]): string {
    return `#${rgb[0].toString(16)}${rgb[1].toString(16)}${rgb[2].toString(16)}`;
}