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
		public var sw_id:uint;
		private var unscaled_x:uint;
		private var unscaled_y:uint;
		private var unscaled_width:uint;
		private var unscaled_height:uint;
		public var start_sec:uint;
		public var stop_sec:uint;

		private var delay_timeout_id:uint;
		private var stop_timeout_id:uint;
		
		private var mediastrings:Array = new Array();
		
		private var SWChilds:Array = new Array;

		private var current_media:SWMedia;
		private var is_playing:Boolean = false;

		// Time in seconds that should be skipped on first run to make sure,
		// that all screens would play synchronously even when started
		// on different times.
		private var _timeshift:Number;
	    public function set timeshift(_set:Number):void
	    {
			this._timeshift = _set;
	    }
	    public function get timeshift():Number
	    {
			return this._timeshift;
	    }
		
		public function SWBundle(layout_str:String, layout_duration:uint)
		{
			this.layout_duration = layout_duration;
			var bundle_split:Array = layout_str.split(';');
			//id;position_x;position_y;position_z;dimension_x;dimension_y;start_sec;stop_sec
			this.sw_id = bundle_split[0].replace(' ','');
			
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
			
			Application.application.log(this.className + '.' + this.className + ': ' + this.sw_id + ', ' 
					+ this.unscaled_width + 'x' + this.unscaled_height + '+' + this.unscaled_x + '+' + this.unscaled_y);
		}

		private function play(event:Event):void
		{
			event.stopPropagation();
			this.removeEventListener(Event.ADDED, play);
			this.addEventListener(Event.REMOVED, stop, false, 0, true);
			
			Application.application.log(this.className + '.' + 'play: ' + 'Play bundle ' + this.sw_id);
			this.stop_timeout_id = setTimeout(stopMedias, this.stop_sec*1000 - this.timeshift*1000);

			if ( this.timeshift == 0 || this.timeshift < this.start_sec )
			{
				var _delay:Number = this.start_sec*1000 - this.timeshift*1000;
				this.timeshift = 0;
				this.delay_timeout_id = setTimeout(playNextMediaOnTimer, _delay);
			}
			else
			{
				//Application.application.log(this.className + '.' + 'play: ' + 'else:'+this.timeshift + '-' + this.start_sec);
				this.timeshift = this.timeshift - this.start_sec;
				while ( this.timeshift > 0 )
				{
					this.setNextMedia();
					//Application.application.log(this.className + '.' + 'play: ' + 'loop:'+this.timeshift + '-' + this.current_media.length);
					this.timeshift = Math.max(0,this.timeshift-this.current_media.duration);
				}
				this.delay_timeout_id = setTimeout(playNextMediaOnTimer, 0);
			}
		}

		private function stop(event:Event):void
		{
			event.stopPropagation();
			this.removeEventListener(Event.REMOVED, stop);
			this.addEventListener(Event.ADDED, play, false, 0, true);
			clearTimeout(this.delay_timeout_id);
			clearTimeout(this.stop_timeout_id);
				
			Application.application.log(this.className + '.' + 'stop: ' + 'Stop bundle ' + this.sw_id + ', ' + event.currentTarget.toString());
			
			while (this.numChildren > 0)
			{
				try { this.removeChildAt(0); }
				catch (e:Error) { Application.application.log(this.className + '.' + 'stop: ' + 'Failed RM@' + this.sw_id + '. ' + e.toString()); }
			}
			
			this.current_media = null;
		}



		private function playNextMediaOnTimer():void
		{
			clearTimeout(this.delay_timeout_id);
			
			var old_media:SWMedia = this.current_media;
			
			this.setNextMedia();

			if ( this.timeshift > this.current_media.duration )
			{
				this.timeshift = this.timeshift - this.current_media.duration;
				return; 
			}

			this.delay_timeout_id = setTimeout(playNextMediaOnTimer, this.current_media.duration*1000 - this.timeshift*1000);

			this.timeshift = 0;
			

			if ( old_media != null && this.contains(old_media) )
			{
				Application.application.log(this.className + '.' + 'playNextMediaOnTimer: ' + '- NM@' + this.sw_id + '. ' + old_media.toString());
				try { this.removeChild(old_media); }
				catch (e:Error) { Application.application.log('Failed - NM@' + this.sw_id + '. ' + e.toString()); }
			}
			
			Application.application.log(this.className + '.' + 'playNextMediaOnTimer: ' + '+ NM@' + this.sw_id + '. ' + this.current_media.toString());
			this.addChild(this.current_media);
		}		

		
		private function stopMedias():void
		{
			parent.removeChild(this);
		}
		
		
		private function setNextMedia():void
		{
			if (this.mediastrings.length == 0)
			{
				this.mediastrings = Application.application.readComponentData(this.sw_id+'.bundle');
			} 
			var mediastring:String = this.mediastrings.shift();
			if (mediastring == '')
			{
				this.mediastrings = Application.application.readComponentData(this.sw_id+'.bundle');
				mediastring = this.mediastrings.shift();
			}

			if (this.SWChilds[mediastring] == null)
			{
				this.SWChilds[mediastring] = new SWMedia(mediastring);
			}
			
			if ( 
				( SWMedia(this.SWChilds[mediastring]).valid_from_date == null
				  || SWMedia(this.SWChilds[mediastring]).valid_from_date.getTime() < new Date().getTime() )
				&&
				( SWMedia(this.SWChilds[mediastring]).valid_to_date == null
				  || SWMedia(this.SWChilds[mediastring]).valid_to_date.getTime() + 24*60*60*1000 > new Date().getTime() )
			)
			{
				this.current_media = SWMedia(this.SWChilds[mediastring]);
			}
			else
			{
				this.setNextMedia();
			}
		}
		
		public function resize():void
		{
			this.x = this.unscaled_x * Application.application._x_coef;
			this.y = this.unscaled_y * Application.application._y_coef;
			this.width = this.unscaled_width * Application.application._x_coef;
			this.height = this.unscaled_height * Application.application._y_coef;

			for (var i:uint=0; i<this.numChildren; i++)
			{
				this.getChildAt(i).width = this.width;
				this.getChildAt(i).height = this.height;
				SWMedia(this.getChildAt(i)).resize();
			}
		}

		override public function toString():String
		{
			return this.sw_id + ':' + super.toString();
		}
		

	}
}