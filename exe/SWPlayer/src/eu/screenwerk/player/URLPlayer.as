package eu.screenwerk.player
{
	import flash.events.Event;
	import flash.filesystem.File;
	
	import mx.controls.HTML;
	import mx.core.Application;
	
	public class URLPlayer extends HTML
	{
		
		public function URLPlayer(id:uint)
		{
			var media_file:File = Application.application.sw_dir.resolvePath(id+'.url');
			var media_string:String = Application.application.readFileContents(media_file);
			var media_split:Array = media_string.split("\n");
			var url:String = media_split.shift();

			this.location = url;
			
			this.addEventListener(Event.ADDED, play);
			this.addEventListener(Event.REMOVED, stop);
		}

		private function play(event:Event):void
		{
			event.stopPropagation();
			
			this.x = 0;
			this.y = 0;
			this.width = parent.width;
			this.height = parent.height;
		}
		private function stop(event:Event):void
		{
			event.stopPropagation();
		}
	}
}