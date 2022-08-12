import {
	BaseInputParams,
	BindingTarget,
	CompositeConstraint,
	createRangeConstraint,
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

function isGradientStopArr(params: GradientStop[] | any): params is GradientStop[] {
	return (params as GradientStop[]).every((grad) => grad.stop !== undefined && (((grad.color as ColorRGB).r !== undefined && (grad.color as ColorRGB).g !== undefined && (grad.color as ColorRGB).b !== undefined) || ((grad.color as ColorHSV).h !== undefined && (grad.color as ColorHSV).s !== undefined && (grad.color as ColorHSV).v !== undefined) || typeof grad.color === 'string'));
}

export interface PluginInputParams extends BaseInputParams {
	max?: number;
	min?: number;
	colorSpace: COLOR_SPACES;
}

// NOTE: You can see JSDoc comments of `InputBindingPlugin` for details about each property
//
// `InputBindingPlugin<In, Ex, P>` means...
// - The plugin receives the bound value as `Ex`,
// - converts `Ex` into `In` and holds it
// - P is the type of the parsed parameters
//

export const GradientGeneratorPlugin: InputBindingPlugin<
	GradientStop[],
	GradientStop[],
	PluginInputParams
> = {
	id: 'gradient',
	// type: The plugin type. (input or monitor)
	type: 'input',

	// This plugin template injects a compiled CSS by @rollup/plugin-replace
	// See rollup.config.js for details
	css: '__css__',

	accept(exValue: unknown, params: Record<string, unknown>) {
		if (!isGradientStopArr(exValue) && (exValue as GradientStop[])?.length > 0) {
			// Return null to deny the user input
			return null;
		}

		// Parse parameters object
		const p = ParamsParsers;
		const result = parseParams<PluginInputParams>(params, {
			colorSpace: p.optional.custom((value:unknown) => {
				// @ts-ignore
				if (Object.values(COLOR_SPACES).includes(value)) {
					return value as COLOR_SPACES;
				}
				return COLOR_SPACES.RGB
			}),

			max: p.optional.number,
			min: p.optional.number,
		});
		if (!result) {
			return null;
		}

		// Return a typed value and params to accept the user input
		return {
			initialValue: exValue as GradientStop[],
			params: result,
		};
	},

	binding: {
		reader(_args) {
			return (exValue: unknown): GradientStop[] => {
				// Convert an external unknown value into the internal value
				return isGradientStopArr(exValue) ? exValue as GradientStop[] : [
					{ color: '#000000', stop: 0.0 },
					{ color: '#ffffff', stop: 1.0 },
				];
			};
		},

		// constraint(args) {
		// 	// Create a value constraint from the user input
		// 	const constraints = [];
		// 	// You can reuse existing functions of the default plugins
		// 	const cr = createRangeConstraint(args.params);
		// 	if (cr) {
		// 		constraints.push(cr);
		// 	}
		// 	return new CompositeConstraint(constraints);
		// },

		writer(_args) {
			return (target: BindingTarget, inValue) => {
				// Use `target.write()` to write the primitive value to the target,
				// or `target.writeProperty()` to write a property of the target
				target.write(inValue);
			};
		},
	},

	controller(args) {
		// Create a controller for the plugin
		return new PluginController(args.document, {
			value: args.value,
			viewProps: args.viewProps,
		});
	},
};
