# Tweakpane plugin template
Gradient Generator input binding for [Tweakpane][tweakpane].


## Installation



### Browser
```html
<script src="tweakpane.min.js"></script>
<script src="tormak-tweakpane-plugin-gradient.min.js"></script>
<script>
  const pane = new Tweakpane.Pane();
  pane.registerPlugin(GradientGeneratorPlugin);
</script>
```


### Package
```js
import {Pane} from 'tweakpane';
import * as GradientGeneratorPlugin from '@tormak/tweakpane-plugin-gradient';

const pane = new Pane();
pane.registerPlugin(GradientGeneratorPlugin);
```


## Usage
```js
pane.registerPlugin(GradientGeneratorPlugin);

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
  'colorSpace': GradientGeneratorPlugin.COLOR_SPACES.RGB
}).on('change', (ev) => {
  console.log(ev.value.getGradient());
});
```


[tweakpane]: https://github.com/cocopon/tweakpane/
