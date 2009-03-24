package eu.screenwerk
{
    import flash.display.*;
    import flash.events.*;
    import flash.geom.*;
    
    import mx.controls.Button;
    import mx.core.Application;
    import mx.skins.halo.ButtonSkin;
	
	public class DummyButton extends Button
	{
		private var _R:String;
		private var _G:String;
		private var _B:String;
		private var _RGB1:String;
		private var _RGB2:String;
		
		private var _init_x:uint;
		private var _init_y:uint;
		private var _init_w:uint;
		private var _init_h:uint;
	
		public function DummyButton(x:uint, y:uint, w:uint, h:uint) 
		{
			this._init_x = x;
			this._init_y = y;
			this._init_w = w;
			this._init_h = h;

			this.rescale();
			
			this._RGB1 = this.type2RGB(x*y+w+h);
			this._RGB2 = this.type2RGB(w*h+x+y);
			
			var fillColors:Array = [0xE60000, this._RGB2];
			this.setStyle("fillColors", fillColors);
			this.setStyle("downSkin", mx.skins.halo.ButtonSkin);

			var g:Graphics = this.graphics;
			g.clear();
			var fillType:String = GradientType.RADIAL;
			var colors:Array = [this._RGB1, this._RGB2];
			var alphas:Array = [1, 1];
			var ratios:Array = [0x66, 0xFF];
			var matr:Matrix = new Matrix();
			matr.createGradientBox(9, 9, 0, 1, 1);
			var spreadMethod:String = SpreadMethod.PAD;
			g.beginGradientFill(fillType, colors, alphas, ratios, matr, spreadMethod);  
            g.drawCircle(11,11,9);
            g.endFill();
            
		}

		public function rescale():void
		{
			this.x = this._init_x * Application.application._x_coef;
			this.y = this._init_y * Application.application._y_coef;
			this.width = this._init_w * Application.application._x_coef;
			this.height = this._init_h * Application.application._y_coef;
		}

		private function type2RGB(type:int):String
		{
			this._R = ((type*64)%256).toString(16).toUpperCase();
			if (this._R.length == 1) this._R = "0"+_R;
			this._G = ((type*96)%256).toString(16).toUpperCase();
			if (this._G.length == 1) this._G = "0"+_G;
			this._B = ((type*147)%256).toString(16).toUpperCase();
			if (this._B.length == 1) this._B = "0"+this._B;

			return "0x"+this._R+this._G+this._B;
		}		
		
	}
}