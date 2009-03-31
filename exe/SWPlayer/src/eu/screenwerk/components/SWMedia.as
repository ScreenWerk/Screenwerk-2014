package eu.screenwerk.components
{
	import eu.screenwerk.player.HTMLPlayer;
	
	import flash.display.DisplayObject;
	import flash.events.Event;
	import flash.filesystem.File;
	
	import mx.core.Application;
	import mx.core.UIComponent;
	
	public class SWMedia extends UIComponent
	{
		public var sw_id:uint;
		public var length:uint;
		private var type:String;
		private var media:DisplayObject;
		
		
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
			
			trace( new Date().toString() + " Play " + this.type
				+	". Dimensions " + this.width + 'x' + this.height);

			if (this.type == 'url')
			{
				var media_file:File = Application.application.sw_dir.resolvePath(this.sw_id+'.url');
				var media_string:String = Application.application.readFileContents(media_file);
				var media_split:Array = media_string.split("\n");
				var url:String = media_split.shift();
				
				this.media = new HTMLPlayer(0,0,this.width,this.height,url);
				this.addChild(this.media);
			}

		}
		
		private function stop(event:Event):void
		{
			event.stopPropagation();
				
		}

	}
}