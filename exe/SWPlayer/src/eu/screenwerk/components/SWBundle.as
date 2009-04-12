package eu.screenwerk.components
{
	import flash.events.Event;
	import flash.utils.clearTimeout;
	import flash.utils.setTimeout;
	
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

		private var delay_timeout_id:uint;
		private var stop_timeout_id:uint;
		
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
			
			
			this.addEventListener(Event.ADDED, play, false, 0, true);
		}

		private function play(event:Event):void
		{
			event.stopPropagation();
			this.removeEventListener(Event.ADDED, play);
			this.addEventListener(Event.REMOVED, stop, false, 0, true);
			
			if (this.is_playing) return;
			this.is_playing = true;

			Application.application.log('play bundle ' + this.sw_id);

			trace( new Date().toString() + " Play bundle " + this.sw_id
				+	". Start at " + this.start_sec + ", stopping at " + this.stop_sec
				+	". Targeted " + event.currentTarget.toString());

			trace( new Date().toString() + " Bundle " + this.sw_id
				+	" dimensions " + this.width + 'x' + this.height );
				
			this.delay_timeout_id = setTimeout(playNextMediaOnTimer, this.start_sec*1000);
			this.stop_timeout_id = setTimeout(stopMedias, this.stop_sec*1000);
		}

		private function stop(event:Event):void
		{
			event.stopPropagation();
			this.removeEventListener(Event.REMOVED, stop);
			clearTimeout(this.delay_timeout_id);
			clearTimeout(this.stop_timeout_id);
				
			Application.application.log("Stop bundle " + this.sw_id + ". Targeted " + event.currentTarget.toString());
			
			while (this.numChildren > 0)
			{
				Application.application.log('RM@' + this.sw_id + '. ' + this.getChildAt(0).toString());
				this.removeChildAt(0);
			}
				
		}



		private function playNextMediaOnTimer():void
		{
			clearTimeout(this.delay_timeout_id);
			
			var old_media:SWMedia = this.current_media;
			
			this.setNextMedia();

			this.delay_timeout_id = setTimeout(playNextMediaOnTimer, this.current_media.length*1000);

			this.addChild(this.current_media);

			try
			{
				this.removeChild(old_media);
			}
			catch (err:Error) {
				trace( "No previous media for bundle " + this.sw_id + "." );
			}
		}		

		
		private function stopMedias():void
		{
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

		override public function toString():String
		{
			return this.sw_id + ':' + super.toString();
		}
		

	}
}