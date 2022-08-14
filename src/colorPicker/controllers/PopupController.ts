import { Controller, createValue, PopupView, Value, ViewProps } from "@tweakpane/core";

interface Config {
	viewProps: ViewProps;
}

export class PopupController implements Controller<PopupView> {
	public readonly shows: Value<boolean> = createValue<boolean>(false);
	public readonly view: PopupView;
	public readonly viewProps: ViewProps;

	constructor(doc: Document, config: Config) {
		this.viewProps = config.viewProps;
		this.view = new PopupView(doc, {
			shows: this.shows,
			viewProps: this.viewProps,
		});
	}
}
