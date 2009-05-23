package eu.screenwerk.components
{
	import flash.events.Event;
	import flash.system.System;
	
	import mx.core.Application;
	import mx.core.UIComponent;
	
	public class SWLayout extends UIComponent
	{
		public var sw_id:uint;
		public var duration:uint;
		private var design_width:uint;
		private var design_height:uint;
		private var frequency:uint;
		private var probability:uint;
		private var valid_from_date:Date;
		private var valid_to_date:Date;

		private var bundlestrings:Array;
		
		private var SWChilds:Array = new Array;

		private var last_date:Date;
		private var next_date:Date;
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

		public function SWLayout(layout_str:String)
		{
			var layout_split:Array = layout_str.split(';');
			//id;duration;width;height;frequency;probability;valid_from_date;valid_to_date
			this.sw_id = layout_split[0].replace(' ','');
			
			this.duration = layout_split[1].replace(' ','');
			this.design_width = layout_split[2].replace(' ','');
			this.design_height = layout_split[3].replace(' ','');
			this.frequency = layout_split[4].replace(' ','');
			this.probability = layout_split[5].replace(' ','');
			var from_split:Array = layout_split[6].toString().split('-');
			this.valid_from_date = new Date(from_split[0], from_split[1], from_split[2]);
			var to_split:Array = layout_split[7].toString().split('-');
			this.valid_to_date = new Date(to_split[0], to_split[1], to_split[2]);

			this.addEventListener(Event.ADDED, play, false, 0, true);
			
			Application.application.log(this.className + '.' + this.className + ': ' + this.sw_id + ' - ' + this.design_width + 'X' + this.design_height );
		}


		private function play(event:Event):void
		{
			event.stopPropagation();
			this.removeEventListener(Event.ADDED, play);
			this.addEventListener(Event.REMOVED, stop, false, 0, true);
		
			//
			//
			//
			flash.system.System.gc();
			//
			//
			//
			
			Application.application.log(this.className + '.play: ' + 'Play layout ' + this.sw_id);

			this.x = 0;
			this.y = 0;
			this.width = parent.width;
			this.height = parent.height;
			Application.application._x_coef = this.width/this.design_width;
			Application.application._y_coef = this.height/this.design_height;
			
			this.playBundles();
			this.timeshift = 0;
		}
		
		private function stop(event:Event):void
		{
			event.stopPropagation();
			this.removeEventListener(Event.REMOVED, stop);
			this.addEventListener(Event.ADDED, play, false, 0, true);

			this.is_playing = false;

			Application.application.log(this.className + '.stop: ' + ' Stop layout ' + this.sw_id + ', ' + event.currentTarget.toString());
				
			while (this.numChildren > 0)
			{
				this.removeChildAt(0);
			}
				
		}

		private function playBundles():void
		{
			
			this.bundlestrings = Application.application.readComponentData(this.sw_id+'.layout');

			while ( bundlestrings.length > 0 )
			{
				var bundle_string:String = bundlestrings.shift();
				if (bundle_string == '') continue;
				
				if (this.SWChilds[bundle_string] == null)
				{
					this.SWChilds[bundle_string] = new SWBundle(bundle_string, this.duration);
					Application.application.log(this.className + '.playBundles: ' + ' Bundle ' + this.SWChilds[bundle_string].sw_id + " loaded.");
				} 

				SWBundle(this.SWChilds[bundle_string]).timeshift = this.timeshift;
				this.addChild(this.SWChilds[bundle_string]);
			}

		}
		

		public function resize():void
		{
			for (var i:uint=0; i<this.numChildren; i++)
			{
				SWBundle(this.getChildAt(i)).resize();
			}
		}

		override public function toString():String
		{
			return this.sw_id + ':' + super.toString();
		}

	}
}