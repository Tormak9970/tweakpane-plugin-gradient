import {ClassName, Value, View, ViewProps} from '@tweakpane/core';

interface Config {
	value: Value<GradientStop[]>;
	viewProps: ViewProps;
}

// Create a class name generator from the view name
// ClassName('tmp') will generate a CSS class name like `tp-tmpv`
const className = ClassName('gradient');

// Custom view class should implement `View` interface
export class PluginView implements View {
	public readonly element: HTMLElement;
	private _value: Value<GradientStop[]>;

	private _addStop: HTMLDivElement;
	private _removeStop: HTMLDivElement;
	private _canvas: HTMLCanvasElement;

	private _cycleIdx: HTMLElement;
	private _setPos: HTMLElement;

	colorButton: HTMLDivElement;
	// private _stopColor: HTMLInputElement;

	constructor(doc: Document, config: Config) {
		// Create a root element for the plugin
		this.element = doc.createElement('div');
		this.element.classList.add(className());
		// Bind view props to the element
		config.viewProps.bindClassModifiers(this.element);

		// Receive the bound value from the controller
		this._value = config.value;
		// Handle 'change' event of the value
		this._value.emitter.on('change', this._onValueChange.bind(this));

		// Create child elements
		{
			const arCont = doc.createElement('div');
			arCont.classList.add(className('ar_cont'));

			this._addStop = doc.createElement('div');
			this._addStop.classList.add(className('edit_stops'));
			this._addStop.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--! Font Awesome Pro 6.1.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path d="M432 256c0 17.69-14.33 32.01-32 32.01H256v144c0 17.69-14.33 31.99-32 31.99s-32-14.3-32-31.99v-144H48c-17.67 0-32-14.32-32-32.01s14.33-31.99 32-31.99H192v-144c0-17.69 14.33-32.01 32-32.01s32 14.32 32 32.01v144h144C417.7 224 432 238.3 432 256z"/></svg>`;
			this._addStop.addEventListener("click", this._addStopFunc);
			arCont.appendChild(this._addStop);

			this._removeStop = doc.createElement('div');
			this._removeStop.classList.add(className('edit_stops'));
			this._removeStop.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--! Font Awesome Pro 6.1.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path d="M400 288h-352c-17.69 0-32-14.32-32-32.01s14.31-31.99 32-31.99h352c17.69 0 32 14.3 32 31.99S417.7 288 400 288z"/></svg>`;
			this._removeStop.addEventListener("click", this._removeStopFunc);
			arCont.appendChild(this._removeStop);

			this.element.appendChild(arCont);
		}


		{
			const canvasCont = doc.createElement('div');
			canvasCont.classList.add(className('canvas_cont'));

			this._canvas = doc.createElement('canvas');
			this._canvas.height = 20;
			this._canvas.width = 150;
			this._canvas.classList.add(className('canvas'));
			canvasCont.appendChild(this._canvas);
			this.element.appendChild(canvasCont);
		}
		

		{
			const ctrlCont = doc.createElement('div');
			ctrlCont.classList.add(className('ctrl_cont'));

			this._cycleIdx = doc.createElement('div');
			this._cycleIdx.classList.add(className('cycle_idx'));
			ctrlCont.appendChild(this._cycleIdx);

			this._setPos = doc.createElement('div');
			this._setPos.classList.add(className('set_pos'));
			ctrlCont.appendChild(this._setPos);

			this.element.appendChild(ctrlCont);
		}

		{
			const colCont = doc.createElement('div');
			colCont.classList.add(className('col_cont'));

			this.colorButton = doc.createElement('div');
			this.colorButton.classList.add(className('stop_color_view'));
			colCont.appendChild(this.colorButton);

			// this._stopColor = doc.createElement('input');
			// this._stopColor.type = "color";
			// this._stopColor.classList.add(className('stop_color_input'));
			// this._stopColor.addEventListener('input', this._setStopColor);
			// colCont.appendChild(this._stopColor);

			this.element.appendChild(colCont);
		}

		// Apply the initial value
		this._refresh();

		config.viewProps.handleDispose(() => {
			// Called when the view is disposing
			console.log('TODO: dispose view');
		});
	}

	private _cycleStopIdx(e:Event) {

	}

	private _addStopFunc(e:Event) {

	}
	private _removeStopFunc(e:Event) {

	}
	private _setStopPos(e:Event) {

	}
	private _setStopColor(e:Event) {

	}

	private _refresh(): void {
		const rawValue = this._value.rawValue;

		const ctx = <CanvasRenderingContext2D>this._canvas.getContext("2d");
		const gradient = ctx.createLinearGradient(0, 0, 150, 0);

		for (let i = 0; i < rawValue.length; i++) {
			const stop = rawValue[i];

			gradient.addColorStop(stop.stop, (typeof stop.color == 'string' ? stop.color : ((stop.color as ColorRGB).r !== undefined ? `rgb(${(stop.color as ColorRGB).r}, ${(stop.color as ColorRGB).g}, ${(stop.color as ColorRGB).b})` : `hsv(${(stop.color as ColorHSV).h}, ${(stop.color as ColorHSV).s}, ${(stop.color as ColorHSV).v})`)));

			// create little indicator here and set pos
		}

		ctx.fillStyle = gradient;
		ctx.fillRect(0, 0, 150, 20);
	}

	private _onValueChange() {
		this._refresh();
	}
}
