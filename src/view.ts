import {ClassName, mapRange, Value, View, ViewProps} from '@tweakpane/core';

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
	private _canvas: HTMLCanvasElement;

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
		const canvasCont = doc.createElement('div');
		canvasCont.classList.add(className('canvas_cont'));

		this._canvas = doc.createElement('canvas');
		this._canvas.height = 20;
		this._canvas.width = 140;
		this._canvas.classList.add(className('canvas'));
		canvasCont.appendChild(this._canvas);
		this.element.appendChild(canvasCont);

		// Apply the initial value
		this._refresh();

		config.viewProps.handleDispose(() => {
			// Called when the view is disposing
			console.log('TODO: dispose view');
		});
	}

	private _refresh(): void {
		const rawValue = this._value.rawValue;

		const ctx = <CanvasRenderingContext2D>this._canvas.getContext("2d");
		const gradient = ctx.createLinearGradient(0, 0, 140, 0);

		for (let i = 0; i < rawValue.length; i++) {
			const stop = rawValue[i];

			gradient.addColorStop(stop.stop, (typeof stop.color == 'string' ? stop.color : ((stop.color as ColorRGB).r !== undefined ? `rgb(${(stop.color as ColorRGB).r}, ${(stop.color as ColorRGB).g}, ${(stop.color as ColorRGB).b})` : `hsv(${(stop.color as ColorHSV).h}, ${(stop.color as ColorHSV).s}, ${(stop.color as ColorHSV).v})`)));
		}

		ctx.fillStyle = gradient;
		ctx.fillRect(0, 0, 140, 20);
	}

	private _onValueChange() {
		this._refresh();
	}
}
