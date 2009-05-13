package eu.screenwerk.player
{
	import flash.events.Event;
	import flash.filesystem.File;
	
	import mx.controls.SWFLoader;
	import mx.core.Application;
	
	public class SWSWFPlayer extends SWFLoader
	{
		private var sw_id:uint;
				
		public function SWSWFPlayer(sw_id:uint)
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
		}
		
		private function _stop(event:Event):void
		{
			event.stopPropagation();
			this.removeEventListener(Event.REMOVED, _stop);
		}

		public function play():void
		{
			var swf_file:File = Application.application.media_dir.resolvePath(this.sw_id + '.SWF');
			this.source = swf_file.url;
		}
	}
}