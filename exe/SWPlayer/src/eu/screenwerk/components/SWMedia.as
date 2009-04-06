package eu.screenwerk.components
{
	import eu.screenwerk.player.*;
	
	import flash.display.DisplayObject;
	import flash.events.Event;
	
	import mx.controls.VideoDisplay;
	import mx.core.Application;
	import mx.core.UIComponent;
	
	public class SWMedia extends UIComponent
	{
		public var sw_id:uint;
		public var length:uint;
		private var type:String;
		private var media:DisplayObject;
		private var is_playing:Boolean = false;
		
		
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
			
			this.addEventListener(Event.ADDED, play);
			this.addEventListener(Event.REMOVED, stop);

		}

		private function play(event:Event):void
		{
			event.stopPropagation();

			if (this.is_playing) return;
			this.is_playing = true;

			trace( new Date().toString() + " Start media " + this.sw_id
				+	". Targeted " + event.currentTarget.toString());
				

			this.width = parent.width;
			this.height = parent.height;
			
			trace( new Date().toString() + " Play " + this.type
				+	". Dimensions " + this.width + 'x' + this.height);
				
			Application.application.log('play ' + this.type + ' ' + this.sw_id);

			switch (this.type)
			{
				case 'url':
					this.media = new URLPlayer(this.sw_id);
					this.addChild(this.media);
					break;
				case 'image':
					this.media = new ImagePlayer(this.sw_id);
					this.addChild(this.media);
					break;
				case 'html':
					//this.media = new HTMLPlayer(this.sw_id);
					//this.addChild(this.media);
					break;
				case 'video':


					var mymedia:VideoDisplay = new VideoDisplay;
					this.addChild(mymedia);
					mymedia.maintainAspectRatio = false;
					
					mymedia.height = this.height;
					mymedia.width = this.width;
					var video_file:File = Application.application.sw_dir.resolvePath(
											this.sw_id + '.video.flv');
					mymedia.source = video_file.url; 
					mymedia.play();

//					this.media = new SWVideoPlayer(this.sw_id);
//					this.media.width = this.width;
//					this.media.height = this.height;
//					this.addChild(this.media);

// camera works
//                var cam:Camera = Camera.getCamera();
//                mymedia.attachCamera(cam)
					break;
				case 'flash':
					break;
				case 'pdf':
					break;
			}
			trace( new Date().toString() + " " + this.type
				+	" loaded.");
		}
		
		private function stop(event:Event):void
		{
			event.stopPropagation();
			trace( new Date().toString() + " Stop media " + this.sw_id
				+	". Targeted " + event.currentTarget.toString());
				
		}

	}
}