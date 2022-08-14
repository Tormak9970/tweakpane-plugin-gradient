import { View, bindValue, Value, ViewProps, valueToClassName, ClassName } from "@tweakpane/core";

interface Config {
	container?:Element;
	shows: Value<boolean>;
	viewProps: ViewProps;
}

const className = ClassName('pop_custom');

/**
 * @hidden
 */
export class PopupView implements View {
	public readonly element: HTMLElement;

	constructor(doc: Document, config: Config) {
		this.element = doc.createElement('div');
		this.element.classList.add(className());
		config.viewProps.bindClassModifiers(this.element);
		bindValue(
			config.shows,
			valueToClassName(this.element, className(undefined, 'v')),
		);
	}
}
