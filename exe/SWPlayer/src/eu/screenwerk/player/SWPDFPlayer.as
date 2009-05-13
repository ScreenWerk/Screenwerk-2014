package eu.screenwerk.player
{
	import flash.events.Event;
	import flash.filesystem.File;
	
	import mx.controls.HTML;
	import mx.core.Application;
	
	public class SWPDFPlayer extends HTML
	{
		private var sw_id:uint;
				
		public function SWPDFPlayer(sw_id:uint)
		{
			this.sw_id = sw_id;

			this.addEventListener(Event.ADDED, _play, false, 0, true);
			this.addEventListener(Event.REMOVED, _stop, false, 0, true);
		}

		private function _play(event:Event):void
		{
			event.stopPropagation();
			this.removeEventListener(Event.ADDED, _play);

			this.x = 0;
			this.y = 0;
			this.width = parent.width;
			this.height = parent.height;
		}
		
		private function _stop(event:Event):void
		{
			event.stopPropagation();
			this.removeEventListener(Event.REMOVED, _stop);
		}

		public function play():void
		{
			var media_file:File = Application.application.media_dir.resolvePath(this.sw_id+'.PDF');

//			var content:String = '<html><body><object id="PDFObj" data="' + media_file.url + '" type="application/pdf" width="100%" height="100%"></object></body></html>';
			var content:String = '<embed src="' + media_file.url + '#toolbar=0&navpanes=0&scrollbar=0" width="100%" height="100%">';

			this.htmlText = content;
		}
	}
}