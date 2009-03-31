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
			trace ( new Date().toString() + " Create screen " + this.sw_id );

			var schedules:Array = Application.application.readComponentData(this.sw_id+'.screen');
			
			var schedule_str:String = schedules.shift();
			var schedule_a:Array = schedule_str.split(';');
			this.schedule_id = schedule_a[0];
			
			this.addEventListener(Event.ADDED, play);
			this.addEventListener(Event.REMOVED, stop);

		}
		
		private function play(event:Event):void
		{
			event.stopPropagation();
			trace (new Date().toString() + " Play screen " + this.sw_id
				+	". Targeted " + event.currentTarget.toString());
			this.sw_schedule = new SWSchedule(this.schedule_id);
			this.sw_schedule.x = 0;
			this.sw_schedule.y = 0;
			this.sw_schedule.width = this.width;
			this.sw_schedule.height = this.height;
			this.addChild(this.sw_schedule);
		}

		private function stop(event:Event):void
		{
			event.stopPropagation();
			trace (new Date().toString() + " Stop screen " + this.sw_id
				+	". Targeted " + event.currentTarget.toString());
			this.removeChild(this.sw_schedule);
			this.sw_schedule = null;
		}
	}
}