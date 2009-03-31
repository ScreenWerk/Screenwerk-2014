package eu.screenwerk.components
{
	import flash.events.Event;
	
	import mx.core.UIComponent;
	
	public class SWMedia extends UIComponent
	{
		public var sw_id:uint;
		public var length:uint;
		private var type:String;
		
		
		public function SWMedia(media_str:String)
		{
			var media_split:Array = media_str.split(';');
			//id;length;type;frequency;appearances;importance;probability;valid_from_date;valid_to_date
			this.sw_id = media_split[0].replace(' ','');
			trace ( new Date().toString() + " Create media " + this.sw_id );
			this.length = media_split[1].replace(' ','');
			this.type = media_split[2].replace(' ','');
			this.x = 0;
			this.y = 0;
			
			this.addEventListener(Event.ADDED, play);
			this.addEventListener(Event.REMOVED, stop);

		}

		private function play(event:Event):void
		{
			event.stopPropagation();
			trace( new Date().toString() + " Start media " + this.sw_id
				+	". Targeted " + event.currentTarget.toString());
				

			this.width = parent.width;
			this.height = parent.height;

		}
		
		private function stop(event:Event):void
		{
			event.stopPropagation();
			trace( new Date().toString() + " Stop media " + this.sw_id
				+	". Targeted " + event.currentTarget.toString());
				
		}

	}
}