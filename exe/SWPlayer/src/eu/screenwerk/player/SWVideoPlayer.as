package eu.screenwerk.player
{
	import com.adobe.xml.syndication.generic.*;
	import com.adobesamples.mediawidget.data.*;
	import com.adobesamples.mediawidget.events.*;
	import com.adobesamples.mediawidget.mediatypes.*;
	import com.adobesamples.mediawidget.net.email.*;
	import com.adobesamples.mediawidget.net.feeds.*;
	import com.adobesamples.mediawidget.view.panel.MediaWidgetPanel;
	import com.adobesamples.mediawidget.view.window.*;
	import com.adobesamples.utils.*;
	
	import flash.display.*;
	import flash.events.*;
	import flash.filesystem.File;
	import flash.net.*;
	
	import mx.controls.VideoDisplay;
	import mx.core.Application;

	public class SWVideoPlayer extends VideoDisplay
	{
		private var sw_id:uint;
		private var is_playing:Boolean = false;

			private var __source:String="";
			private var __medialist:MediaList;
			private var panel_manager:MediaWidgetPanel = new MediaWidgetPanel;
		
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
			
			
			var video_file:File = Application.application.sw_dir.resolvePath(this.sw_id + '.video.flv');
			//var video_file:File = Application.application.sw_dir.resolvePath('33.video.flv');

		    trace ( video_file.nativePath );
		    this.source = video_file.url;
 		}
 		
		private function _stop(event:Event):void
		{
			event.stopPropagation();
			

		}

		public function set source(i_val:String):void
		{
			if(__source!=null && i_val!="")
			{
				__source=i_val;
				var extension:String=URLUtils.getExtension(source);
				var group_type:String=SupportedTypes.getTypeGroupFor(extension);
				var mediaitem:MediaList=new MediaList();
				mediaitem.enclosure=source;
				this.medialist=mediaitem;
				dispatchEvent(new Event(Event.CHANGE));
			}
		}
			
		public function get source():String{
			 return __source;
		}

		public function set medialist(i_val:MediaList):void{
			 __medialist=i_val;
			 panel_manager.dataProvider=__medialist; 
		}
		
		public function get medialist():MediaList{
			 return __medialist;
		}
	}
}