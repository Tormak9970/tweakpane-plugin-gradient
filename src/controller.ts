import {
	Color,
	colorToHexRgbString,
	connectValues,
	Controller,
	createNumberFormatter,
	createValue,
	findNextTarget,
	Foldable,
	forceCast,
	getSuitableDecimalDigits,
	getSuitableDraggingScale,
	NumberTextController,
	parseNumber,
	supportsTouch,
	Value,
	ValueMap,
	ViewProps,
} from '@tweakpane/core';
import { ColorPickerController } from './colorPicker/controllers/colorPickerController';
import { PopupController } from './colorPicker/controllers/PopupController';
import { hexToRGB, rgbToHex } from './utils';

import {PluginView} from './view';

enum COLOR_SPACES {
	RGB='rgb',
	HSV='hsv',
	HEX='hex',
}

interface Config {
	value: Value<GradientStop[]>;
	expanded?: boolean,
	colorSpace:COLOR_SPACES,
	viewProps: ViewProps;
}

// Custom controller class should implement `Controller` interface
export class PluginController implements Controller<PluginView> {
	public readonly value: Value<GradientStop[]>;
	public readonly view: PluginView;
	public readonly viewProps: ViewProps;
	
	private readonly _foldable: Foldable;
	private readonly colorPickerC: ColorPickerController;
	private readonly popUpC: PopupController;
	private readonly posInput: NumberTextController;

	private _stopIdx:Value<number> = createValue<number>(0);
	private _curStopPos:Value<number> = createValue<number>(0);
	private _curStopCol:Value<Color> = createValue<Color>(new Color([0, 0, 0], 'rgb'));

	private _colorSpace:COLOR_SPACES;

	constructor(doc: Document, config: Config) {
		this._colorSpace = config.colorSpace;

		this._onButtonBlur = this._onButtonBlur.bind(this);
		this._onButtonClick = this._onButtonClick.bind(this);
		this._onPopupChildBlur = this._onPopupChildBlur.bind(this);
		this._onPopupChildKeydown = this._onPopupChildKeydown.bind(this);

		this._cycleStopIdx = this._cycleStopIdx.bind(this);
		this._addStop = this._addStop.bind(this);
		this._removeStop = this._removeStop.bind(this);
		this._setStopPos = this._setStopPos.bind(this);
		this._setStopColor = this._setStopColor.bind(this);

		// Receive the bound value from the plugin
		this.value = config.value;
		this._curStopPos.setRawValue(this.value.rawValue[0].stop);
		this._curStopCol.setRawValue(this._gradientColToTweakCol(this.value.rawValue[0].color));

		// and also view props
		this.viewProps = config.viewProps;

		this._foldable = Foldable.create(config.expanded ? config.expanded : false);

		// Create a custom view
		this.view = new PluginView(doc, { value: this.value, colBtnCol: this._curStopCol.rawValue, viewProps: this.viewProps, });
		const buttonElem = this.view.colorButton;
		buttonElem.addEventListener('blur', this._onButtonBlur);
		buttonElem.addEventListener('click', this._onButtonClick);

		const addSBtn = this.view.addStop;
		addSBtn.addEventListener('click', this._addStop);
		const remSBtn = this.view.removeStop;
		remSBtn.addEventListener('click', this._removeStop);

		this.view.nCycleIdx.addEventListener('click', () => { this._cycleStopIdx(false); });
		this.view.pCycleIdx.addEventListener('click', () => { this._cycleStopIdx(true); });

		this.popUpC = new PopupController(doc, { viewProps: this.viewProps, });

		this.colorPickerC = new ColorPickerController(doc, { colorType: 'int', value: this._curStopCol, viewProps: this.viewProps, });
		this.colorPickerC.view.allFocusableElements.forEach((elem) => { elem.addEventListener('blur', this._onPopupChildBlur); elem.addEventListener('keydown', this._onPopupChildKeydown); });

		this.view.element.appendChild(this.popUpC.view.element);
		this.popUpC.view.element.appendChild(this.colorPickerC.view.element);

		this.posInput = new NumberTextController(doc, {
			baseStep: 0.01,
			sliderProps: ValueMap.fromObject({
				maxValue: 1.0,
				minValue: 0.0,
			}),
			props: ValueMap.fromObject({
				draggingScale: 0.01,
				formatter: createNumberFormatter(getSuitableDecimalDigits(undefined, 0.01)),
			}),
			parser: parseNumber,
			value: this._curStopPos,
			viewProps: this.viewProps
		})
		this.view.setPos.appendChild(this.posInput.view.element);

		// connect popup
		connectValues({
			primary: this._foldable.value('expanded'),
			secondary: this.popUpC.shows,
			forward: (p) => p.rawValue,
			backward: (_, s) => s.rawValue,
		});

		// connect stopIdx variables
		connectValues({
			primary: this._stopIdx,
			secondary: this.view.stopIdx,
			forward: (p) => p.rawValue,
			backward: (_, s) => s.rawValue,
		});

		// connect curStopPos variables
		connectValues({
			primary: this._curStopPos,
			secondary: this.posInput.value,
			forward: (p) => p.rawValue,
			backward: (_, s) => s.rawValue,
		});
		this._curStopPos.emitter.on('change', this._setStopPos);

		// connect curStopColor variables
		connectValues({
			primary: this._curStopCol,
			secondary: this.colorPickerC.value,
			forward: (p) => p.rawValue,
			backward: (_, s) => s.rawValue,
		});
		connectValues({
			primary: this._curStopCol,
			secondary: this.colorPickerC.value,
			forward: (p) => p.rawValue,
			backward: (_, s) => s.rawValue,
		});
		this._curStopCol.emitter.on('change', this._setStopColor);

		this.viewProps.handleDispose(() => {
			const buttonElem = this.view.colorButton;
			buttonElem.removeEventListener('blur', this._onButtonBlur);
			buttonElem.removeEventListener('click', this._onButtonClick);
			
			const addSBtn = this.view.addStop;
			addSBtn.addEventListener('click', this._addStop);

			const remSBtn = this.view.removeStop;
			remSBtn.addEventListener('click', this._removeStop);

			this.colorPickerC.view.allFocusableElements.forEach((elem) => {
				elem.removeEventListener('blur', this._onPopupChildBlur);
				elem.removeEventListener('keydown', this._onPopupChildKeydown);
			});
		});
	}

	private _cycleStopIdx(dir:boolean) {
		if (dir ? this._stopIdx.rawValue + 1 < this.value.rawValue.length : this._stopIdx.rawValue - 1 >= 0) {
			const newIdx = dir ? this._stopIdx.rawValue + 1 : this._stopIdx.rawValue - 1;
			this._stopIdx.setRawValue(newIdx);
			this._curStopPos.setRawValue(this.value.rawValue[newIdx].stop);

			const curVal = this.value.rawValue[newIdx];
			this._curStopCol.setRawValue(this._gradientColToTweakCol(curVal.color));
		}
	}

	private _tweakColToGradientCol(curVal: Color): ColorRGB | ColorHSV | string {
		switch (this._colorSpace) {
			case COLOR_SPACES.RGB: {
				const comps = curVal.getComponents('rgb', 'int');
				return {
					r: comps[0],
					g: comps[1],
					b: comps[2]
				}
			}
			case COLOR_SPACES.HSV: {
				const comps = curVal.getComponents('hsv', 'int');
				return {
					h: comps[0],
					s: comps[1],
					v: comps[2]
				}
			}
			case COLOR_SPACES.HEX: {
				return rgbToHex(curVal.getComponents('rgb', 'int'));
			}
		}
	}
	private _gradientColToTweakCol(curVal: ColorRGB | ColorHSV | string): Color {
		console.log(this._colorSpace)
		switch (this._colorSpace) {
			case COLOR_SPACES.RGB: {
				let c = curVal as ColorRGB;
				return new Color([c.r, c.g, c.b], 'rgb');
			}
			case COLOR_SPACES.HSV: {
				let c = curVal as ColorHSV;
				return new Color([c.h, c.s, c.v], 'hsv');
			}
			case COLOR_SPACES.HEX: {
				let c = hexToRGB(curVal as string);
				return new Color([c.r, c.g, c.b], 'rgb');
			}
		}
	}

	private _addStop(e:Event) {

	}
	private _removeStop(e:Event) {

	}
	private _setStopPos(e: { rawValue: number; }) {
		let newVal = [...this.value.rawValue];
		const curVal = newVal[this._stopIdx.rawValue];
		newVal[this._stopIdx.rawValue] = {
			color: curVal.color,
			stop: e.rawValue
		}
		this.value.setRawValue(newVal);
	}
	private _setStopColor(e: { rawValue: Color; }) {
		let newVal = [...this.value.rawValue];
		const curVal = newVal[this._stopIdx.rawValue];
		newVal[this._stopIdx.rawValue] = {
			color: this._tweakColToGradientCol(e.rawValue),
			stop: curVal.stop
		}
		this.value.setRawValue(newVal);
	}

	private _onButtonBlur(e: FocusEvent) {
		const elem = this.view.element;
		const nextTarget: HTMLElement | null = forceCast(e.relatedTarget);
		if (!nextTarget || !elem.contains(nextTarget)) {
			this.popUpC.shows.rawValue = false;
		}
	}

	private _onButtonClick() {
		this._foldable.set('expanded', !this._foldable.get('expanded'));
		if (this._foldable.get('expanded')) {
			this.colorPickerC.view.allFocusableElements[0].focus();
		}
	}

	private _onPopupChildBlur(ev: FocusEvent): void {
		const elem = this.popUpC.view.element;
		const nextTarget = findNextTarget(ev);
		if (nextTarget && elem.contains(nextTarget)) {
			// Next target is in the picker
			return;
		}
		if (
			nextTarget &&
			nextTarget === this.view.colorButton &&
			!supportsTouch(elem.ownerDocument)
		) {
			// Next target is the trigger button
			return;
		}

		this.popUpC.shows.rawValue = false;
	}

	private _onPopupChildKeydown(ev: KeyboardEvent): void {
		if (ev.key === 'Escape') {
			this.popUpC.shows.rawValue = false;
		}
	}
}
