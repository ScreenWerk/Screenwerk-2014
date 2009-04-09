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
		private var unscaled_x:uint;
		private var unscaled_y:uint;
		private var unscaled_width:uint;
		private var unscaled_height:uint;
		public var start_sec:uint;
		public var stop_sec:uint;
		
		private var mediastrings:Array = new Array();
		
		private var current_media:SWMedia;
		private var is_playing:Boolean = false;

		
		public function SWBundle(layout_str:String, layout_duration:uint)
		{
			this.layout_duration = layout_duration;
			var bundle_split:Array = layout_str.split(';');
			//id;position_x;position_y;position_z;dimension_x;dimension_y;start_sec;stop_sec
			this.sw_id = bundle_split[0].replace(' ','');
			trace ( new Date().toString() + " Create bundle " + this.sw_id );
			
			this.unscaled_x = bundle_split[1].replace(' ','');
			this.unscaled_y = bundle_split[2].replace(' ','');
			this.unscaled_width = bundle_split[4].replace(' ','');
			this.unscaled_height = bundle_split[5].replace(' ','');

			this.resize();
			
			//this.z = bundle_split[3].replace(' ','');

			this.start_sec = bundle_split[6].replace(' ','');
			this.stop_sec = bundle_split[7].replace(' ','');
			if (this.stop_sec == 0) this.stop_sec = layout_duration;
			
			
			this.addEventListener(Event.ADDED, play);
			this.addEventListener(Event.REMOVED, stop);
		}

		private function play(event:Event):void
		{
			event.stopPropagation();
			
			if (this.is_playing) return;
			this.is_playing = true;

//					var mymedia:VideoDisplay = new VideoDisplay;
//					mymedia.maintainAspectRatio = false;
//					
//					mymedia.height = this.height;
//					mymedia.width = this.width;
//					var video_file:File = Application.application.sw_dir.resolvePath(
//											6 + '.VIDEO');
//					mymedia.source = video_file.url; 
//					this.addChild(mymedia);
//					mymedia.play();
//
			trace( new Date().toString() + " Play bundle " + this.sw_id
				+	". Start at " + this.start_sec + ", stopping at " + this.stop_sec
				+	". Targeted " + event.currentTarget.toString());

			trace( new Date().toString() + " Bundle " + this.sw_id
				+	" dimensions " + this.width + 'x' + this.height );
				
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
			this.is_playing = false;
			
			trace( new Date().toString() + " Stop bundle " + this.sw_id
				+	". Targeted " + event.currentTarget.toString());
				
		}



		private function playNextMediaOnTimer(event:TimerEvent):void
		{
			event.stopPropagation();
			
			var old_media:SWMedia = this.current_media;
			
			this.setNextMedia();

			var timer:Timer = new Timer(this.current_media.length*1000, 1);
			timer.addEventListener(TimerEvent.TIMER, playNextMediaOnTimer);
			timer.start();

			this.addChild(this.current_media);

			try
			{
				//trace( new Date().toString() + " Stopping media " + this.current_media.sw_id + "..." );
				this.removeChild(old_media);
			}
			catch (err:Error) {
				trace( "No previous media for bundle " + this.sw_id + "." );
			}
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

		public function resize():void
		{
			this.x = this.unscaled_x * Application.application._x_coef;
			this.y = this.unscaled_y * Application.application._y_coef;
			this.width = this.unscaled_width * Application.application._x_coef;
			this.height = this.unscaled_height * Application.application._y_coef;

			trace( new Date().toString() + " Bundle " + this.sw_id
				+	" resized to "
				+	this.width + 'x' + this.height
				 );

			for (var i:uint=0; i<this.numChildren; i++)
			{
				SWMedia(this.getChildAt(i)).resize();
				this.getChildAt(i).width = this.width;
				this.getChildAt(i).height = this.height;
			}
		}

		

	}
}