package eu.screenwerk.player
{
	import flash.events.Event;
	
	import mx.controls.VideoDisplay;
	
	public class VideoPlayer extends VideoDisplay
	{
		private var sw_id:uint;
		
		public function VideoPlayer(sw_id:uint) 
		{
			this.sw_id = sw_id;
			this.addEventListener(Event.ADDED, _play);
			this.addEventListener(Event.REMOVED, _stop);
		}

		private function _play(event:Event):void
		{
			event.stopPropagation();

			this.x = 0;
			this.y = 0;
			this.width = parent.width;
			this.height = parent.height;
			this.maintainAspectRatio = false;
			
			try
			{
				this.source = this.sw_id + ".video";
				this.play();
			} catch (e:Error)
			{}
 		}
		private function _stop(event:Event):void
		{
			event.stopPropagation();
			
			this.stop();
		}

	}
}