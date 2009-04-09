package eu.screenwerk.components
{
	import flash.events.Event;
	
	import mx.core.Application;
	import mx.core.UIComponent;
	
	public class SWLayout extends UIComponent
	{
		public var sw_id:uint;
		public var length:uint;
		private var frequency:uint;
		private var probability:uint;
		private var valid_from_date:Date;
		private var valid_to_date:Date;

		private var bundlestrings:Array;
		
		private var last_date:Date;
		private var next_date:Date;
		private var is_playing:Boolean = false;

		public function SWLayout(layout_str:String)
		{
			var layout_split:Array = layout_str.split(';');
			//id;length;frequency;probability;valid_from_date;valid_to_date
			this.sw_id = layout_split[0].replace(' ','');
			trace ( new Date().toString() + " Create layout " + this.sw_id );
			
			this.length = layout_split[1].replace(' ','');
			this.frequency = layout_split[2].replace(' ','');
			this.probability = layout_split[3].replace(' ','');
			var from_split:Array = layout_split[4].toString().split('-');
			this.valid_from_date = new Date(from_split[0], from_split[1], from_split[2]);
			var to_split:Array = layout_split[4].toString().split('-');
			this.valid_to_date = new Date(to_split[0], to_split[1], to_split[2]);

			this.addEventListener(Event.ADDED, play);
			this.addEventListener(Event.REMOVED, stop);
		}


		private function play(event:Event):void
		{
			event.stopPropagation();
			
			if (this.is_playing) return;
			this.is_playing = true;

			trace( new Date().toString() + " Play layout " + this.sw_id
				+	". Targeted " + event.currentTarget.toString());
				
			this.x = 0;
			this.y = 0;
			this.width = parent.width;
			this.height = parent.height;
			
			this.playBundles();
		}
		
		private function stop(event:Event):void
		{
			event.stopPropagation();
			this.is_playing = false;
			trace( new Date().toString() + " Stop layout " + this.sw_id
				+	". Targeted " + event.currentTarget.toString());
				
		}

		private function playBundles():void
		{
			
			this.bundlestrings = Application.application.readComponentData(this.sw_id+'.layout');

			while ( bundlestrings.length > 0 )
			{
				var bundle_string:String = bundlestrings.shift();
				if (bundle_string == '') continue;
				
				var swbundle:SWBundle = new SWBundle(bundle_string, this.length);
				this.addChild(swbundle);
			}

		}
		

		public function resize():void
		{
			for (var i:uint=0; i<this.numChildren; i++)
			{
				SWBundle(this.getChildAt(i)).resize();
			}
		}

	}
}