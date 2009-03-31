package eu.screenwerk.components
{
	import flash.events.Event;
	import flash.events.TimerEvent;
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
			trace ( new Date().toString() + " Create bundle " + this.sw_id );
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

		private function play(event:Event):void
		{
			event.stopPropagation();
			trace( new Date().toString() + " Play bundle " + this.sw_id
				+	". Start at " + this.start_sec + ", stopping at " + this.stop_sec
				+	". Targeted " + event.currentTarget.toString());
				
			var startTimer:Timer = new Timer(this.start_sec*1000, 1);
			startTimer.addEventListener(TimerEvent.TIMER, playNextMediaOnTimer);
			startTimer.start();
			var stopTimer:Timer = new Timer(this.stop_sec*1000, 1);
			stopTimer.addEventListener(TimerEvent.TIMER, stopMedias);
			stopTimer.start();
		}

		private function stop(event:Event):void
		{
			event.stopPropagation();
			trace( new Date().toString() + " Stop bundle " + this.sw_id
				+	". Targeted " + event.currentTarget.toString());
				
		}



		private function playNextMediaOnTimer(event:TimerEvent):void
		{
			event.stopPropagation();
			
			try
			{
				//trace( new Date().toString() + " Stopping media " + this.current_media.sw_id + "..." );
				this.removeChild(this.current_media);
			}
			catch (err:Error) {
				trace( "No current media for bundle " + this.sw_id + "." );
			}
			
			this.setNextMedia();

			var timer:Timer = new Timer(this.current_media.length*1000);
			timer.addEventListener(TimerEvent.TIMER, playNextMediaOnTimer);
			timer.start();

			this.addChild(this.current_media);
		}		

		
		private function stopMedias(event:TimerEvent):void
		{
			event.stopPropagation();
			while (this.numChildren > 0)
			{
				removeChildAt(0);
			}
			parent.removeChild(this);
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
			this.mediastrings = Application.application.readComponentData(this.sw_id+'.bundle');
		}

		

	}
}