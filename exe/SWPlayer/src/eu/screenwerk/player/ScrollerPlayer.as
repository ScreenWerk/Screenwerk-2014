package eu.screenwerk.player
{
	import eu.screenwerk.DummyButton;
	
	public class ScrollerPlayer extends UIComponent
	{
		private var sw_id:uint;
		
		public function ScrollerPlayer(sw_id:uint) 
		{
			this.sw_id = sw_id;
			this.addEventListener(Event.ADDED, play);
			this.addEventListener(Event.REMOVED, stop);
		}

		private function play(event:Event):void
		{
			event.stopPropagation();

			this.x = 0;
			this.y = 0;
			this.width = parent.width;
			this.height = parent.height;
		}
		private function stop(event:Event):void
		{
			event.stopPropagation();
		}
	}
}