package eu.screenwerk.components
{
	import flash.events.Event;
	
	import mx.core.Application;
	import mx.core.UIComponent;
	
	
	public class SWScreen extends UIComponent
	{
		//public var sw_id:uint;
		private var sw_schedule:SWSchedule;
		private var schedule_id:uint;
		private var is_playing:Boolean = false;

		public function SWScreen()
		{
			var schedules:Array = Application.application.readComponentData('screen.rc');
			
			var schedule_str:String = schedules.shift();
			var schedule_a:Array = schedule_str.split(';');
			this.schedule_id = schedule_a[0];
			
			this.addEventListener(Event.ADDED, play, false, 0, true);
			
			Application.application.log(this.className + '.' + this.className + '.' );
		}
		
		private function play(event:Event):void
		{
			event.stopPropagation();
			this.removeEventListener(Event.ADDED, play);
			this.addEventListener(Event.REMOVED, stop, false, 0, true);

			if (this.is_playing) return;
			this.is_playing = true;

			Application.application.log(this.className + '.play: ' + 'Play screen ' + event.currentTarget.toString());

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
			this.removeEventListener(Event.REMOVED, stop);

			Application.application.log(this.className + '.stop: ' + 'Stop screen ' + event.currentTarget.toString());
			
			while (this.numChildren>0)
			{
				this.removeChildAt(0);
			}

		}

		public function resize():void
		{
			for (var i:uint=0; i<this.numChildren; i++)
			{
				SWSchedule(this.getChildAt(i)).resize();
				this.getChildAt(i).width = this.width;
				this.getChildAt(i).height = this.height;
			}
		}
		override public function toString():String
		{
			return 'screen:' + super.toString();
		}

	}
}