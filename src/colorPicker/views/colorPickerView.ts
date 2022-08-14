import { ClassName, View } from "@tweakpane/core";
import { ColorTextView } from "./ColorTextView";
import { HPaletteView } from "./HPaletteView";
import { SvPaletteView } from "./SvPaletteView";


const className = ClassName('colp');

interface Config {
	hPaletteView: HPaletteView;
	supportsAlpha: boolean;
	svPaletteView: SvPaletteView;
	textView: ColorTextView;
}

export class ColorPickerView implements View {
	public readonly element: HTMLElement;
	private readonly hPaletteView_: HPaletteView;
	private readonly svPaletteView_: SvPaletteView;
	private readonly textView_: ColorTextView;

	constructor(doc: Document, config: Config) {
		this.element = doc.createElement('div');
		this.element.classList.add(className());

		const hsvElem = doc.createElement('div');
		hsvElem.classList.add(className('hsv'));

		const svElem = doc.createElement('div');
		svElem.classList.add(className('sv'));
		this.svPaletteView_ = config.svPaletteView;
		svElem.appendChild(this.svPaletteView_.element);
		hsvElem.appendChild(svElem);

		const hElem = doc.createElement('div');
		hElem.classList.add(className('h'));
		this.hPaletteView_ = config.hPaletteView;
		hElem.appendChild(this.hPaletteView_.element);
		hsvElem.appendChild(hElem);
		this.element.appendChild(hsvElem);

		const rgbElem = doc.createElement('div');
		rgbElem.classList.add(className('rgb'));
		this.textView_ = config.textView;
		rgbElem.appendChild(this.textView_.element);
		this.element.appendChild(rgbElem);
	}

	get allFocusableElements(): HTMLElement[] {
		const elems = [
			this.svPaletteView_.element,
			this.hPaletteView_.element,
			this.textView_.modeSelectElement,
			...this.textView_.textViews.map((v) => v.inputElement),
		];
		return elems;
	}
}
