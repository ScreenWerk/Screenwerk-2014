package eu.screenwerk.player
{
	import flash.events.Event;
	import flash.filesystem.File;
	
	import mx.controls.Alert;
	import mx.controls.Image;
	import mx.core.Application;
	
	public class ImagePlayer extends Image
	{
		private var sw_id:uint;
		
		public function ImagePlayer(sw_id:uint) 
		{
			this.sw_id = sw_id;

			this.addEventListener(Event.ADDED, play, false, 0, true);
		}

		private function play(event:Event):void
		{
			event.stopPropagation();
			this.removeEventListener(Event.ADDED, play);
			this.addEventListener(Event.REMOVED, stop, false, 0, true);

			trace( new Date().toString() + " Start imageplayer " + this.sw_id
				+	". Targeted " + event.currentTarget.toString());

			this.x = 0;
			this.y = 0;
			this.width = parent.width;
			this.height = parent.height;
			this.maintainAspectRatio = false;
			
			var image_file:File = Application.application.sw_dir.resolvePath(this.sw_id + '.IMAGE');
			this.source = image_file.url;
		}
		
		private function stop(event:Event):void
		{
			event.stopPropagation();
			this.removeEventListener(Event.REMOVED, stop);
			trace( new Date().toString() + " Stop imageplayer for " + this.source
				+	". Targeted " + event.currentTarget.toString());
		}
	}
}