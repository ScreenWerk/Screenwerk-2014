package eu.screenwerk.components
{
	import flash.events.Event;
	
	import mx.core.UIComponent;
	
	public class SWMedia extends UIComponent
	{
		private var sw_id:uint;
		public var length:uint;
		private var type:String;
		
		
		public function SWMedia(media_str:String)
		{
			var media_split:Array = media_str.split(';');
			//id;length;type;frequency;appearances;importance;probability;valid_from_date;valid_to_date
			this.sw_id = media_split[0].replace(' ','');
			this.length = media_split[1].replace(' ','');
			this.type = media_split[2].replace(' ','');
			this.x = 0;
			this.y = 0;
			
			this.addEventListener(Event.ADDED, play);
			this.addEventListener(Event.REMOVED, stop);

		}

		public function play(event:Event = null):void
		{
			this.width = parent.width;
			this.height = parent.height;

		}
		
		public function stop():void
		{
			
		}

	}
}