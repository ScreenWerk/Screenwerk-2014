package eu.screenwerk.components
{
	import mx.core.UIComponent;
	
	public class SWBundle extends UIComponent
	{
		public function SWBundle()
		{
		}

		public function play():void
		{
			this.x = 0;
			this.y = 0;
			this.width = parent.width;
			this.height = parent.height;

			parent.addChild(this);
		}
		
		public function stop():void
		{
			parent.removeChild(this);
		}

	}
}