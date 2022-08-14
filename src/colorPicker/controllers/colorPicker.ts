import { Color, Controller, parseNumber, Value, ViewProps } from "@tweakpane/core";
import { ColorPickerView } from "../views/colorPickerView";
import { ColorTextController } from "./ColorTextController";
import { HPaletteController } from "./HPaletteController";
import { SvPaletteController } from "./SvPaletteController";
import { ColorType } from "../model/ColorModel";


interface Config {
	colorType: ColorType;
	value: Value<Color>;
	viewProps: ViewProps;
}

/**
 * @hidden
 */
export class ColorPickerController implements Controller<ColorPickerView> {
	public readonly value: Value<Color>;
	public readonly view: ColorPickerView;
	public readonly viewProps: ViewProps;
	private readonly hPaletteC_: HPaletteController;
	private readonly svPaletteC_: SvPaletteController;
	private readonly textC_: ColorTextController;

	constructor(doc: Document, config: Config) {
		this.value = config.value;
		this.viewProps = config.viewProps;

		this.hPaletteC_ = new HPaletteController(doc, {
			value: this.value,
			viewProps: this.viewProps,
		});
		this.svPaletteC_ = new SvPaletteController(doc, {
			value: this.value,
			viewProps: this.viewProps,
		});
		this.textC_ = new ColorTextController(doc, {
			colorType: config.colorType,
			parser: parseNumber,
			value: this.value,
			viewProps: this.viewProps,
		});

		this.view = new ColorPickerView(doc, {
			hPaletteView: this.hPaletteC_.view,
			supportsAlpha: false,
			svPaletteView: this.svPaletteC_.view,
			textView: this.textC_.view,
		});
	}

	get textController(): ColorTextController {
		return this.textC_;
	}
}
