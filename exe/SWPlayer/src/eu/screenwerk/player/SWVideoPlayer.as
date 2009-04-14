package eu.screenwerk.player
{
	import flash.events.Event;
	import flash.filesystem.File;
	
	import mx.controls.VideoDisplay;
	import mx.core.Application;
	

	public class SWVideoPlayer extends VideoDisplay
	{
		private var sw_id:uint;
		private var is_playing:Boolean = false;

		
		public function SWVideoPlayer(sw_id:uint) 
		{
			this.sw_id = sw_id;

			this.addEventListener(Event.ADDED, _play, false, 0, true);
			this.addEventListener(Event.REMOVED, _stop, false, 0, true);
		}

		private function _play(event:Event):void
		{
    		event.stopPropagation();
			this.removeEventListener(Event.ADDED, _play);

			this.x = 0;
			this.y = 0;
			this.width = parent.width;
			this.height = parent.height;
			this.maintainAspectRatio = false;
			
			var video_file:File = Application.application.sw_dir.resolvePath(this.sw_id + '.VIDEO');
			this.source = video_file.url; 
 		}
 		
		private function _stop(event:Event):void
		{
			event.stopPropagation();
		}

		override public function toString():String
		{
			return this.sw_id + ':' + super.toString();
		}

	}
}