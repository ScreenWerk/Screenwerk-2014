package eu.screenwerk.player
{

	public class SWVideoPlayer extends VideoDisplay
	{
		private var sw_id:uint;
		private var is_playing:Boolean = false;

		
		public function SWVideoPlayer(sw_id:uint) 
		{

			this.sw_id = sw_id;

			this.x = 0;
			this.y = 0;
			//this.maintainAspectRatio = false;

			this.addEventListener(Event.ADDED, _play);
			this.addEventListener(Event.REMOVED, _stop);
			
		}

		private function _play(event:Event):void
		{
    		event.stopPropagation();
			if (this.is_playing) return;
			this.is_playing = true;

			this.width = parent.width;
			this.height = parent.height;
			
			
			var video_file:File = Application.application.sw_dir.resolvePath(this.sw_id + '.VIDEO');
			//var video_file:File = Application.application.sw_dir.resolvePath('33.video.flv');

		    trace ( video_file.nativePath );
		    this.source = video_file.url;
 		}
 		
		private function _stop(event:Event):void
		{
			event.stopPropagation();
			

		}

	}
}