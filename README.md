# Tweakpane plugin template
Gradient Generator input binding for [Tweakpane][tweakpane].


## Installation


### Browser
```html
<script src="tweakpane.min.js"></script>
<script src="tweakpane-plugin-gradient.min.js"></script>
<script>
  const pane = new Tweakpane.Pane();
  pane.registerPlugin(TweakpaneGradientPlugin);
</script>
```


### Package
```js
import {Pane} from 'tweakpane';
import * as TweakpaneGradientPlugin from 'tweakpane-plugin-gradient';

const pane = new Pane();
pane.registerPlugin(TweakpaneGradientPlugin);
```


## Usage
```js
pane.registerPlugin(TweakpaneGradientPlugin);

const params = {
  'Gradient': {
    'stops': [
      { color: '#32a852', stop: 0 },
      { color: '#3246a8', stop: 1 },
    ]
  },
};

pane.addInput(params, 'Gradient', {
	'view': 'gradient',
  'colorSpace': TweakpaneGradientPlugin.COLOR_SPACES.RGB
}).on('change', (ev) => {
  console.log(ev.value.getGradient());
});
```


[tweakpane]: https://github.com/cocopon/tweakpane/
