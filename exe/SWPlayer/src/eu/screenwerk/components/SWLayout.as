package eu.screenwerk.components
{
	import flash.events.Event;
	import flash.filesystem.File;
	
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

		public function SWLayout(layout_str:String)
		{
			var layout_split:Array = layout_str.split(';');
			//id;length;frequency;probability;valid_from_date;valid_to_date
			this.sw_id = layout_split[0].replace(' ','');
			trace ("Create layout " + this.sw_id);
			this.length = layout_split[1].replace(' ','');
			this.frequency = layout_split[2].replace(' ','');
			this.probability = layout_split[3].replace(' ','');
			var from_split:Array = layout_split[4].toString().split('-');
			this.valid_from_date = new Date(from_split[0], from_split[1], from_split[2]);
			var to_split:Array = layout_split[4].toString().split('-');
			this.valid_to_date = new Date(to_split[0], to_split[1], to_split[2]);
		}


		public function play(event:Event):void
		{
			this.x = 0;
			this.y = 0;
			this.width = parent.width;
			this.height = parent.height;
			
			this.playBundles();
		}
		
		public function stop(event:Event):void
		{
		}

		private function playBundles():void
		{
			var layout_file:File = Application.application.sw_dir.resolvePath(this.sw_id+'.layout');
			var layout_string:String = Application.application.readFileContents(layout_file);
			this.bundlestrings = layout_string.split("\n");
			var columns:String = this.bundlestrings.shift(); // discard first line with column descriptors

			while ( bundlestrings.length > 0 )
			{
				var bundle_string:String = bundlestrings.shift();
				if (bundle_string == '') continue;
				
				var swbundle:SWBundle = new SWBundle(bundle_string, this.length);
				this.addChild(swbundle);
			}

		}
		

	}
}