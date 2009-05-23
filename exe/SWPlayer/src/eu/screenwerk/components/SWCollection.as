package eu.screenwerk.components
{
	import flash.events.Event;
	import flash.utils.clearTimeout;
	import flash.utils.setTimeout;
	
	import mx.core.Application;
	import mx.core.UIComponent;
	
	public class SWCollection extends UIComponent
	{
		public var sw_id:uint;
		private var cron_minute:String;
		private var cron_hour:String;
		private var cron_day:String;
		private var cron_month:String;
		private var cron_weekday:String;
		private var valid_from_date:Date;
		private var valid_to_date:Date;
		private var valid_from_J:uint;
		private var valid_to_J:uint;

		private var timeout_id:uint;
		
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
		
		private var layoutstrings:Array = new Array();
		private var SWChilds:Array = new Array;
		
		private var current_layout:SWLayout;
		private var is_playing:Boolean = false;
	
		public function SWCollection(collectionstring:String)
		{
			var cronline_a:Array = collectionstring.split(';');
			this.sw_id = cronline_a[0].replace(' ','');
			
			this.cron_minute = cronline_a[1].replace(' ','');
			this.cron_hour = cronline_a[2].replace(' ','');
			this.cron_day = cronline_a[3].replace(' ','');
			this.cron_month = cronline_a[4].replace(' ','');
			this.cron_weekday = cronline_a[5].replace(' ','');

			var from_split:Array = cronline_a[6].toString().split('-');
			this.valid_from_date = new Date(from_split[0], from_split[1], from_split[2]);
			this.valid_from_J = Math.floor( this.valid_from_date.getTime() / 1000 / 60 / 60 / 24 );

			var to_split:Array = cronline_a[7].toString().split('-');
			this.valid_to_date = new Date(to_split[0], to_split[1], to_split[2]);
			this.valid_to_J = Math.floor( this.valid_to_date.getTime() / 1000 / 60 / 60 / 24 );
			
			this.setLastDate();
			this.setNextDate();

			this.addEventListener(Event.ADDED, play, false, 0, true);

			Application.application.log(this.className + '.' + this.className + ': ' + this.sw_id + ' - ' + this.lastDate.toTimeString() + '..' + this.nextDate.toTimeString() );
		}
		
		public function play(event:Event):void
		{
			event.stopPropagation();
			this.removeEventListener(Event.ADDED, play);
			this.addEventListener(Event.REMOVED, stop, false, 0, true);
			
			Application.application.log(this.className + '.play: ' + 'Play collection ' + this.sw_id + ', ' + event.currentTarget.toString());
				
			this.timeshift = (new Date().getTime() - this.lastDate.getTime()) / 1000;
			
			this.x = 0;
			this.y = 0;
			this.width = parent.width;
			this.height = parent.height;

			this.playLayouts();
		}
		
		public function stop(event:Event):void
		{
			event.stopPropagation();
			this.removeEventListener(Event.REMOVED, stop);

			clearTimeout(this.timeout_id);

			Application.application.log(this.className + '.play: ' + 'Stop collection ' + this.sw_id + ', ' + event.currentTarget.toString());
								
			while (this.numChildren>0)
			{
				this.removeChildAt(0);
			}

		}
		

		private var last_date:Date;
	    public function get lastDate():Date
	    {
			return this.last_date;
	    }
		
		private var next_date:Date;
	    public function get nextDate():Date
	    {
			return this.next_date;
	    }
		
		private function playLayouts():void
		{
			if ( this.current_layout == null )
			{
				this.setNextLayout();
				Application.application.log(this.className + '.playLayouts: ' + 'Collection 1st run ' + this.sw_id 
					+ ', evaluating layout ' + this.current_layout.sw_id );
			}
			
			while ( this.current_layout.duration < this.timeshift )
			{
				this.timeshift = this.timeshift - this.current_layout.duration;
				this.setNextLayout();
				//Application.application.log(this.className + '.playLayouts: ' + '... skipping layout ' + this.current_layout.sw_id );
			}

			Application.application.log(this.className + '.playLayouts: ' + '... starting layout ' + this.current_layout.sw_id 
				+ ', stopping after ' + (this.current_layout.duration - this.timeshift) + 'sec.' );

			this.timeout_id = setTimeout(playNextLayoutOnTimer, (this.current_layout.duration - this.timeshift)*1000 );

			this.current_layout.timeshift = this.timeshift;
			this.timeshift = 0;
			this.addChild(this.current_layout);
		}
		
		private function playNextLayoutOnTimer():void
		{
			clearTimeout(this.timeout_id);

			this.removeChild(this.current_layout);

			this.setNextLayout();

			Application.application.log(this.className + '.playNextLayoutOnTimer: ' + 'Collection ' + this.sw_id 
				+ ', starting layout ' + this.current_layout.sw_id 
				+ ', stopping after ' + this.current_layout.duration + 'sec.' );

			this.timeout_id = setTimeout(playNextLayoutOnTimer, this.current_layout.duration*1000);

			this.addChild(this.current_layout);
		}		
		
		private function setNextLayout():void
		{
			if (this.layoutstrings.length == 0) this.loadLayouts();
			var layoutstring:String = this.layoutstrings.shift();
			if (layoutstring == '')
			{
				this.loadLayouts();
				layoutstring == this.layoutstrings.shift();
			}

			if (this.SWChilds[layoutstring] == null)
			{
				this.SWChilds[layoutstring] = new SWLayout(layoutstring);
				Application.application.log(this.className + '.setNextLayout: ' + 'Layout ' + this.SWChilds[layoutstring].sw_id + ' loaded.');
			} 

			this.current_layout = this.SWChilds[layoutstring];
		}

		private function loadLayouts():void
		{
			this.layoutstrings = Application.application.readComponentData(this.sw_id+'.collection');
		}
			
		public function setLastDate():void
		{
			var last_date:Date = null;
			
			var now:Date = new Date();
			var now_J:uint = Math.floor( now.getTime() / 1000 / 60 / 60 / 24 );
			var i_date:Date = new Date(Math.floor(now.getTime()/1000/60)*60*1000);
			
			for (var i:uint=0;i<366;i++)
			{
				last_date = null;
				
				if (now_J-i > this.valid_to_J) continue;
				if (now_J-i < this.valid_from_J) break;
				
				//i_date = new Date(now.getTime()-i*1000*60*60*24);
				i_date.setTime(i_date.getTime()-1000*60*60*24);
				
	            if (this.instring(this.cron_day.toString(), i_date.getDate().toString()) == false) continue;
	            if (this.instring(this.cron_month.toString(), i_date.getMonth().toString()) == false) continue;
	            if (this.instring(this.cron_weekday.toString(), i_date.getDay().toString()) == false) continue;
	            
           		last_date = i_date;

	            if (i == 0)
	            {
	            	if (this.biggest_of_le(this.cron_hour, now.getHours()) === -1) continue;
            		last_date.setHours(this.biggest_of_le(this.cron_hour, now.getHours()));
	            } 
	            else
	            {
            		last_date.setHours(this.biggest_of_le(this.cron_hour, 23));
	            }

				// if today AND current hour
	            if (i == 0 && last_date.getHours() == now.getHours())
	            {
	            	if (this.biggest_of_le(this.cron_minute, now.getMinutes()) === -1)
	            	{
	            		if (last_date.getHours() == 0 ) continue;
	            		if (this.biggest_of_le(this.cron_hour, now.getHours()-1) === -1) continue;
	            		last_date.setHours(this.biggest_of_le(this.cron_hour, now.getHours()-1));
	            	}
	            	last_date.setMinutes(this.biggest_of_le(this.cron_minute, 59));
	            } 
	            else
	            {
	            	last_date.setMinutes(this.biggest_of_le(this.cron_minute, 59));
	            }
	            
	            this.last_date = last_date;
	            return;
			}
			
			this.last_date = null;
		}
		
		public function setNextDate():void
		{
			var next_date:Date = null;
			
			var now:Date = new Date();
			var now_J:uint = Math.floor( now.getTime() / 1000 / 60 / 60 / 24 );
			var i_date:Date = new Date(Math.ceil(now.getTime()/1000/60)*60*1000);

			for (var i:uint=0;i<366;i++)
			{
				next_date = null;
				
				if (now_J+i < this.valid_from_J) continue;
				if (now_J+i > this.valid_to_J) break;
				
				//i_date = new Date(now.getTime()+i*1000*60*60*24);
				i_date.setTime(i_date.getTime()+1000*60*60*24);
				
	            if (this.instring(this.cron_day.toString(), i_date.getDate().toString()) == false) continue;
	            if (this.instring(this.cron_month.toString(), i_date.getMonth().toString()) == false) continue;
	            if (this.instring(this.cron_weekday.toString(), i_date.getDay().toString()) == false) continue;
	            
           		next_date = i_date;

	            if (i == 0)
	            {
	            	if (this.smallest_of_ge(this.cron_hour, now.getHours()) === -1) continue;
            		next_date.setHours(this.smallest_of_ge(this.cron_hour, now.getHours()));
	            } 
	            else
	            {
            		next_date.setHours(this.smallest_of_ge(this.cron_hour, 0));
	            }

				// if today AND current hour
	            if (i == 0 && next_date.getHours() == now.getHours())
	            {
	            	if (this.smallest_of_ge(this.cron_minute, now.getMinutes()) === -1)
	            	{
	            		if (next_date.getHours() == 23 ) continue;
	            		if (this.smallest_of_ge(this.cron_hour, now.getHours()+1) === -1) continue;
	            		next_date.setHours(this.smallest_of_ge(this.cron_hour, now.getHours()+1));
	            	}
	            	next_date.setMinutes(this.smallest_of_ge(this.cron_minute, 0));
	            } 
	            else
	            {
	            	next_date.setMinutes(this.smallest_of_ge(this.cron_minute, 0));
	            }
	            
	            this.next_date = next_date;
	            return;
			}
			
			this.next_date = null;
		}
		
		private function instring(hay:String,needle:String):Boolean
		{
			if (hay == '*') return true;
			
			var hay_a:Array = hay.split(',');
			while ( hay_a.length > 0 )
			{
				var hay_part:String = hay_a.shift();
				if (hay_part == needle) return true;
			}
			return false;
		}
		
		private function biggest_of_le(hay:String,needle:Number):Number
		{
			if (hay == '*') return needle;
			
			var hay_a:Array = hay.split(',');
			hay_a.sort(Array.NUMERIC);
			while ( hay_a.length > 0 )
			{
				var candidate:Number = Number(hay_a.pop());
				if (candidate > needle) continue;
				return candidate;
			}
			return -1;
		}

		private function smallest_of_ge(hay:String,needle:Number):Number
		{
			if (hay == '*') return needle;
			
			var hay_a:Array = hay.split(',');
			hay_a.sort(Array.NUMERIC);
			while ( hay_a.length > 0 )
			{
				var candidate:Number = Number(hay_a.shift());
				if (candidate < needle) continue;
				return candidate;
			}
			return -1;
		}

		public function resize():void
		{
			for (var i:uint=0; i<this.numChildren; i++)
			{
				SWLayout(this.getChildAt(i)).resize();
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

