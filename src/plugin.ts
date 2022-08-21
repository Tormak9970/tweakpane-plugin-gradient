import {
	BaseInputParams,
	BindingTarget,
	InputBindingPlugin,
	ParamsParsers,
	parseParams,
} from '@tweakpane/core';

import {PluginController} from './controller';

export enum COLOR_SPACES {
	RGB='rgb',
	HSV='hsv',
	HEX='hex',
}

function isGradientStopArr(params: PluginValue | any): params is PluginValue {
	return (params as PluginValue).stops !== undefined ? ((params as PluginValue).stops.every((grad) => grad.stop !== undefined && (((grad.color as ColorRGB).r !== undefined && (grad.color as ColorRGB).g !== undefined && (grad.color as ColorRGB).b !== undefined) || ((grad.color as ColorHSV).h !== undefined && (grad.color as ColorHSV).s !== undefined && (grad.color as ColorHSV).v !== undefined) || typeof grad.color === 'string'))) : false;
}

export interface PluginInputParams extends BaseInputParams {
	view: 'gradient';
	colorSpace: COLOR_SPACES;
}

export const GradientGeneratorPlugin: InputBindingPlugin<
	PluginValue,
	PluginValue,
	PluginInputParams
> = {
	id: 'gradient',
	type: 'input',
	css: '__css__',

	accept(exValue: unknown, params: Record<string, unknown>) {
		if (!isGradientStopArr(exValue)) {
			// Return null to deny the user input
			return null;
		}

		// Parse parameters object
		const p = ParamsParsers;
		const result = parseParams<PluginInputParams>(params, {
			view: p.required.constant('gradient'),
			colorSpace: p.optional.custom((value:unknown) => {
				if (Object.values(COLOR_SPACES).includes(value as COLOR_SPACES)) {
					return value as COLOR_SPACES;
				}
				return COLOR_SPACES.RGB
			})
		});
		if (!result) {
			return null;
		}

		// Return a typed value and params to accept the user input
		return {
			initialValue: exValue as PluginValue,
			params: result,
		};
	},

	binding: {
		reader(_args) {
			return (exValue: unknown): PluginValue => {
				// Convert an external unknown value into the internal value
				return isGradientStopArr(exValue) ? exValue as PluginValue : {
					'stops': [
						{ color: '#000000', stop: 0.0 },
						{ color: '#ffffff', stop: 1.0 },
					],
					'getGradient': () => { return new ImageData(0, 0); }
				};
			};
		},

		writer(_args) {
			return (target: BindingTarget, inValue) => {
				// Use `target.write()` to write the primitive value to the target,
				// or `target.writeProperty()` to write a property of the target
				target.write(inValue);
			};
		},
	},

	controller(args) {
		return new PluginController(args.document, {
			value: args.value,
			viewProps: args.viewProps,
			colorSpace: args.params.colorSpace
		});
	},
};
