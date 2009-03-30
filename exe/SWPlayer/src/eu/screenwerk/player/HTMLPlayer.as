package eu.screenwerk.player
{
	import mx.controls.HTML;
	import mx.core.Application;
	
	public class HTMLPlayer extends HTML
	{
		private var _dyn_x:uint;
		private var _dyn_y:uint;
		private var _dyn_width:uint;
		private var _dyn_height:uint;

		private var _init_x:uint;
		private var _init_y:uint;
		private var _init_w:uint;
		private var _init_h:uint;
		
		public function HTMLPlayer(x:uint, y:uint, w:uint, h:uint, location:String)
		{
			this._init_x = x;
			this._init_y = y;
			this._init_w = w;
			this._init_h = h;
			this.rescale();

			this.location = location;
		}

		public function rescale():void
		{
			this.x = this._init_x * Application.application._x_coef;
			this.y = this._init_y * Application.application._y_coef;
			this.width = this._init_w * Application.application._x_coef;
			this.height = this._init_h * Application.application._y_coef;
		}

	}
}