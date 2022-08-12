# Tweakpane plugin template
Plugin template of an input binding for [Tweakpane][tweakpane].


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
const params = {
  'Gradient': [
    { color: '#000000', stop: 0 },
    { color: '#ffffff', stop: 1 },
  ],
};

// TODO: Update parameters for your plugin
pane.addInput(params, 'Gradient', {
  'min': 1,
  'max': 10,
  'format': TweakpaneGradientPlugin.COLOR_SPACES.RGB
}).on('change', (ev) => {
  console.log(ev.value);
});
```


[tweakpane]: https://github.com/cocopon/tweakpane/
