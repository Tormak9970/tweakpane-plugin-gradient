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
    const ret = rgb.map(c => {
        c = Math.round(c);
        const r = c.toString(16);
        return r.length == 1 ? `0${r}` : r;
    });
    return `#${ret[0]}${ret[1]}${ret[2]}`;
}

export function rgbToHsv(rgb:number[]) {
    let rr:number;
    let gg:number;
    let bb:number;
    let h:number;
    let s:number;
    const rabs = rgb[0] > 1 ? rgb[0] / 255: rgb[0];
    const gabs = rgb[1] > 1 ? rgb[1] / 255: rgb[1];
    const babs = rgb[2] > 1 ? rgb[2] / 255: rgb[2];
    const v = Math.max(rabs, gabs, babs);
    const diff = v - Math.min(rabs, gabs, babs);
    const diffc = (c:number) => (v - c) / 6 / diff + 1 / 2;
    const percentRoundFn = (num:number) => Math.round(num * 100) / 100;
    if (diff == 0) {
        h = s = 0;
    } else {
        s = diff / v;
        rr = diffc(rabs);
        gg = diffc(gabs);
        bb = diffc(babs);

        if (rabs === v) {
            h = bb - gg;
        } else if (gabs === v) {
            h = (1 / 3) + rr - bb;
        } else { //(babs === v)
            h = (2 / 3) + gg - rr;
        }

        if (h < 0) {
            h += 1;
        }else if (h > 1) {
            h -= 1;
        }
    }
    return {
        h: Math.round(h * 360),
        s: percentRoundFn(s * 100),
        v: percentRoundFn(v * 100)
    };
}