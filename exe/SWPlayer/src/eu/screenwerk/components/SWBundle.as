package eu.screenwerk.components
{
	import flash.events.Event;
	import flash.events.TimerEvent;
	import flash.filesystem.File;
	import flash.utils.Timer;
	
	import mx.core.Application;
	import mx.core.UIComponent;
	
	public class SWBundle extends UIComponent
	{
		private var layout_duration:uint;
		private var sw_id:uint;
		private var position_x:uint;
		private var position_y:uint;
		private var position_z:uint;
		public var start_sec:uint;
		public var stop_sec:uint;
		
		private var mediastrings:Array = new Array();
		
		private var current_media:SWMedia;
		
		
		public function SWBundle(layout_str:String, layout_duration:uint)
		{
			this.layout_duration = layout_duration;
			var bundle_split:Array = layout_str.split(';');
			//id;position_x;position_y;position_z;dimension_x;dimension_y;start_sec;stop_sec
			this.sw_id = bundle_split[0].replace(' ','');
			trace ("Create bundle " + this.sw_id);
			this.x = bundle_split[1].replace(' ','') * Application.application._x_coef;
			this.y = bundle_split[2].replace(' ','') * Application.application._y_coef;
			//this.z = bundle_split[3].replace(' ','');
			this.width = bundle_split[4].replace(' ','') * Application.application._x_coef;
			this.height = bundle_split[5].replace(' ','') * Application.application._y_coef;
			this.start_sec = bundle_split[6].replace(' ','');
			this.stop_sec = bundle_split[7].replace(' ','');
			if (this.stop_sec == 0) this.stop_sec = layout_duration;
			
			this.addEventListener(Event.ADDED, play);
			this.addEventListener(Event.REMOVED, stop);
		}

		public function play(event:Event):void
		{
			var startTimer:Timer = new Timer(this.start_sec*1000);
			startTimer.addEventListener(TimerEvent.TIMER, playMedias);
			startTimer.start();
			var stopTimer:Timer = new Timer(this.stop_sec*1000);
			stopTimer.addEventListener(TimerEvent.TIMER, stopMedias);
			stopTimer.start();
		}



		private function playMedias(event:TimerEvent = null):void
		{
			this.setNextMedia();

			var timer:Timer = new Timer(this.current_media.length*1000);
			timer.addEventListener(TimerEvent.TIMER, playNextMediaOnTimer);
			timer.start();

			this.addChild(this.current_media);
		}
		
		private function setNextMedia():void
		{
			if (this.mediastrings.length == 0) this.loadMedias();
			var mediastring:String = this.mediastrings.shift();
			if (mediastring == '')
			{
				this.loadMedias();
				mediastring = this.mediastrings.shift();
			}
			if (mediastring == '')
			{
				this.loadMedias();
				mediastring = this.mediastrings.shift();
			}
			this.current_media = new SWMedia(mediastring);
		}
		
		private function loadMedias():void
		{
			var bundle_file:File = Application.application.sw_dir.resolvePath(this.sw_id+'.bundle');
			var bundle_string:String = Application.application.readFileContents(bundle_file);
			this.mediastrings = bundle_string.split("\n");
			var columns:String = this.mediastrings.shift(); // discard first line with column descriptors
		}

		private function playNextMediaOnTimer(evt:TimerEvent):void
		{
			this.current_media.stop();
			this.removeChild(this.current_media);

			this.playMedias();
		}		

		
		private function stopMedias():void
		{
			while (this.numChildren > 0)
			{
				removeChildAt(0);
			}
			parent.removeChild(this);
		}
		
		
		public function stop():void
		{
//			parent.RemoveChild(this);
		}


	}
}