package eu.screenwerk.components
{
	import flash.events.Event;
	import flash.filesystem.File;
	
	import mx.core.Application;
	import mx.core.UIComponent;
	
	
	public class SWScreen extends UIComponent
	{
		public var sw_id:uint;
		private var sw_schedule:SWSchedule;
		private var schedule_id:uint;
		
		public function SWScreen(id:uint)
		{
			this.sw_id = id;
			trace ("Create screen " + this.sw_id);

			var screen_file:File = Application.application.sw_dir.resolvePath(this.sw_id+'.screen');
		
			var config_string:String = Application.application.readFileContents(screen_file);
			
			var schedules:Array = config_string.split("\n");
			var columns:String = schedules.shift(); // discard first line with column descriptors
			var schedule_str:String = schedules.shift();
			var schedule_a:Array = schedule_str.split(';');
			this.schedule_id = schedule_a[0];
			
			this.addEventListener(Event.ADDED, play);
			this.addEventListener(Event.REMOVED, stop);

		}
		
		private function play(event:Event):void
		{
			this.sw_schedule = new SWSchedule(this.schedule_id);
			this.sw_schedule.x = 0;
			this.sw_schedule.y = 0;
			this.sw_schedule.width = this.width;
			this.sw_schedule.height = this.height;
			this.addChild(this.sw_schedule);
		}

		private function stop(event:Event):void
		{
			this.removeChild(this.sw_schedule);
			this.sw_schedule = null;
		}
	}
}