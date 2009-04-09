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
		private var is_playing:Boolean = false;
		
		public function ImagePlayer(sw_id:uint) 
		{
			this.sw_id = sw_id;

			this.addEventListener(Event.ADDED, play);
			this.addEventListener(Event.REMOVED, stop);
		}

		private function play(event:Event):void
		{
			event.stopPropagation();
			if (this.is_playing) return;
			this.is_playing = true;
			trace( new Date().toString() + " Start imageplayer " + this.sw_id
				+	". Targeted " + event.currentTarget.toString());

			this.x = 0;
			this.y = 0;
			this.width = parent.width;
			this.height = parent.height;
			
			var image_file:File = Application.application.sw_dir.resolvePath(this.sw_id + '.IMAGE');
		
			this.source = image_file.url;
			this.maintainAspectRatio = false;
		}
		
		private function stop(event:Event):void
		{
			event.stopPropagation();
			trace( new Date().toString() + " Stop imageplayer for " + this.source
				+	". Targeted " + event.currentTarget.toString());
		}
	}
}