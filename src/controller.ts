import {
	Color,
	ColorController,
	colorToRgbNumber,
	connectValues,
	Controller,
	createValue,
	findNextTarget,
	Foldable,
	forceCast,
	PointerHandler,
	PointerHandlerEvent,
	PopupController,
	supportsTouch,
	Value,
	ViewProps,
} from '@tweakpane/core';
import { ColorPickerController } from './colorPicker/controllers/colorPicker';

import {PluginView} from './view';

interface Config {
	value: Value<GradientStop[]>;
	expanded?: boolean,
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

	constructor(doc: Document, config: Config) {
		this._onPoint = this._onPoint.bind(this);

		// Receive the bound value from the plugin
		this.value = config.value;

		// and also view props
		this.viewProps = config.viewProps;

		this._foldable = Foldable.create(config.expanded ? config.expanded : true);

		// Create a custom view
		this.view = new PluginView(doc, {
			value: this.value,
			viewProps: this.viewProps,
		});
		const buttonElem = this.view.colorButton;
		buttonElem.addEventListener('blur', this._onButtonBlur);
		buttonElem.addEventListener('click', this._onButtonClick);

		this.popUpC = new PopupController(doc, {
			viewProps: this.viewProps,
		});

		this.colorPickerC = new ColorPickerController(doc, {
			colorType: 'int',
			value: createValue<Color>(new Color([0, 0, 0], 'rgb')),
			viewProps: this.viewProps,
		});
		this.colorPickerC.view.allFocusableElements.forEach((elem) => {
			elem.addEventListener('blur', this._onPopupChildBlur);
			elem.addEventListener('keydown', this._onPopupChildKeydown);
		});

		this.view.element.appendChild(this.popUpC.view.element);
		this.popUpC.view.element.appendChild(this.colorPickerC.view.element);

		connectValues({
			primary: this._foldable.value('expanded'),
			secondary: this.popUpC.shows,
			forward: (p) => p.rawValue,
			backward: (_, s) => s.rawValue,
		});

		this.viewProps.handleDispose(() => {
			// Called when the controller is disposing
			console.log('TODO: dispose controller');
		});

		// You can use `PointerHandler` to handle pointer events in the same way as Tweakpane do
		const ptHandler = new PointerHandler(this.view.element);
		ptHandler.emitter.on('down', this._onPoint);
		ptHandler.emitter.on('move', this._onPoint);
		ptHandler.emitter.on('up', this._onPoint);
	}

	private _onPoint(ev: PointerHandlerEvent) {
		const data = ev.data;
		if (!data.point) {
			return;
		}

		this.value.rawValue = [];
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
