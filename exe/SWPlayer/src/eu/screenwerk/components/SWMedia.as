package eu.screenwerk.components
{
	import eu.screenwerk.player.*;
	
	import flash.events.Event;
	
	import mx.core.Application;
	import mx.core.UIComponent;
	
	public class SWMedia extends UIComponent
	{
		public var sw_id:uint;
		public var length:uint;
		private var type:String;
		private var is_playing:Boolean = false;
		
		private var SWChilds:Array = new Array;
		
		
		public function SWMedia(media_str:String)
		{
			var media_split:Array = media_str.split(';');
			//id;length;type;frequency;appearances;importance;probability;valid_from_date;valid_to_date
			this.sw_id = media_split[0].replace(' ','');
			trace ( new Date().toString() + " Create media " + this.sw_id );
			this.length = media_split[1].replace(' ','');
			this.type = media_split[2].replace(' ','');
			this.x = 0;
			this.y = 0;
			
			this.addEventListener(Event.ADDED, play, false, 0, true);
		}

		private function play(event:Event):void
		{
			event.stopPropagation();
			this.removeEventListener(Event.ADDED, play);
			this.addEventListener(Event.REMOVED, stop, false, 0, true);
			if (this.is_playing) return;
			this.is_playing = true;

			this.width = parent.width;
			this.height = parent.height;


			trace( new Date().toString() + " Start media " + this.sw_id
				+	". Targeted " + event.currentTarget.toString());
				

			
			trace( new Date().toString() + " Play " + this.type
				+	". Dimensions " + this.width + 'x' + this.height);
				
			Application.application.log('play ' + this.type + ' ' + this.sw_id);

			if (this.SWChilds[this.sw_id] == null)
			{
				switch (this.type)
				{
					case 'URL':
						this.SWChilds[this.sw_id] = new URLPlayer(this.sw_id);
						break;
					case 'IMAGE':
						this.SWChilds[this.sw_id] = new ImagePlayer(this.sw_id);
						break;
					case 'VIDEO':
						this.SWChilds[this.sw_id] = new SWVideoPlayer(this.sw_id);
						break;
					case 'HTML':
						//this.media = new HTMLPlayer(this.sw_id);
						//this.addChild(this.media);
						break;
					case 'FLASH':
						break;
					case 'PDF':
						break;
				}
				Application.application.log( 'Media ' + this.sw_id + "." + this.type + " loaded.");
			}
			this.addChild(this.SWChilds[this.sw_id]);
			this.SWChilds[this.sw_id].play();
		}
		
		private function stop(event:Event):void
		{
			event.stopPropagation();
			this.removeEventListener(Event.REMOVED, stop);
			this.addEventListener(Event.ADDED, play, false, 0, true);
			if (!this.is_playing) return;
			this.is_playing = false;

			while (this.numChildren > 0)
			{
				Application.application.log('RM@' + this.sw_id + '. ' + this.getChildAt(0).toString());
				try
				{
					this.removeChildAt(0);
				} catch (e:Error){
					Application.application.log('Failed RM@' + this.sw_id + '. ' + e.toString());
				}
			}
			
		}

		public function resize():void
		{
			for (var i:uint=0; i<this.numChildren; i++)
			{
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