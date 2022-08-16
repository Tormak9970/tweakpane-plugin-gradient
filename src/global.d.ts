type ColorRGB = {
	r:number,
	g:number,
	b:number
}
type ColorHSV = {
	h:number,
	s:number,
	v:number
}

type GradientStop = {
	color:ColorRGB|ColorHSV|string,
	stop:number
}

type PluginValue = {
	dataURL?:string,
	stops: GradientStop[]
}