package eu.screenwerk.player
{
	import com.adobesamples.mediawidget.MediaWidget;
	
	import flash.events.Event;
	import flash.filesystem.File;
	
	import mx.core.Application;
	import mx.core.UIComponent; 
	
	public class SWVideoPlayer extends UIComponent
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
			
			var video_file:File = Application.application.sw_dir.resolvePath(this.sw_id + '.video');

		    var mywidget:MediaWidget=new MediaWidget(); 
		    mywidget.width=parent.width; 
		    mywidget.height = parent.height; 
		    trace ( video_file.nativePath );
		    this.addChild(mywidget); 
 		}
 		
		private function _stop(event:Event):void
		{
			event.stopPropagation();
			

		}

	}
}