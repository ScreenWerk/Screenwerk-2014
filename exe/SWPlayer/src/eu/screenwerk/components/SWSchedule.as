package eu.screenwerk.components
{
	import flash.events.Event;
	import flash.filesystem.File;
	import flash.utils.clearTimeout;
	import flash.utils.setTimeout;
	
	import mx.core.Application;
	import mx.core.UIComponent;
	
	public class SWSchedule extends UIComponent
	{
		public var sw_id:uint;

		private var timeout_id:uint;
		private var collections:Array;
		private var current_collection:SWCollection;
		private var next_collection:SWCollection;
		private var is_playing:Boolean = false;

		public function SWSchedule(id:uint)
		{
			this.sw_id = id;
			trace ( new Date().toString() + " Create schedule " + this.sw_id );
			
			this.addEventListener(Event.ADDED, play, false, 0, true);

		}
		
		private function play(event:Event):void
		{
			event.stopPropagation();
			this.removeEventListener(Event.ADDED, play);
			this.addEventListener(Event.REMOVED, stop, false, 0, true);

			if (this.is_playing) return;
			this.is_playing = true;

			Application.application.log(" Play schedule " + this.sw_id
				+	". Targeted " + event.currentTarget.toString());
				
			var collectionstrings:Array = Application.application.readComponentData(this.sw_id+'.schedule');

			var current_collection:SWCollection;
			
			var i:uint = 0;
			while ( collectionstrings.length > 0 )
			{
				var collectionstring:String = collectionstrings.shift();
				if (collectionstring == '') continue;
				current_collection = new SWCollection(collectionstring);

				if (i==0)
				{
					this.current_collection = current_collection;
					continue;
				}
				
				if (current_collection.getLastDate().getTime() > this.current_collection.getLastDate().getTime() )
				{
					this.current_collection = current_collection;
				}

				i++;
			}

			this.addChild(this.current_collection);
			var _now:Number = new Date().getTime();
			_now = new Date().getMilliseconds();
			var timeout_msec:Number = Math.max(0,this.current_collection.getNextDate().getTime() - new Date().getTime());
			Application.application.log("Time till next collection - " + timeout_msec/1000 + " seconds.");
			this.timeout_id = setTimeout(playNextCollection, timeout_msec);
		}

		private function stop(event:Event):void
		{
			event.stopPropagation();
			this.removeEventListener(Event.REMOVED, stop);
			this.is_playing = false;
			
			Application.application.log("Stop schedule " + this.sw_id + ". Targeted " + event.currentTarget.toString());
				
			while (this.numChildren>0)
			{
				Application.application.log('RM@' + this.sw_id + '. ' + this.getChildAt(0).toString());
				this.removeChildAt(0);
			}

//			this.removeChild(this.current_collection);
			this.current_collection = null; // TODO: remove this?
		}
		
		private function playNextCollection():void
		{
			clearTimeout(this.timeout_id);
			
			var schedule_file:File = Application.application.sw_dir.resolvePath(this.sw_id+'.schedule');
			var schedule_string:String = Application.application.readFileContents(schedule_file);
			var collectionstrings:Array = schedule_string.split("\n");
			var columns:String = collectionstrings.shift(); // discard first line with column descriptors

			var _collection:SWCollection;
			
			var i:uint = 0;
			while ( collectionstrings.length > 0 )
			{
				var collectionstring:String = collectionstrings.shift();
				
				Application.application.log(collectionstring);
				
				_collection = new SWCollection(collectionstring);

				if (i==0)
				{
					this.next_collection = _collection;
					continue;
				}
				
				if (_collection.getNextDate().getTime() < this.next_collection.getNextDate().getTime() )
				{
					this.next_collection = _collection;
				}

				i++;
			}

			Application.application.log(this.current_collection.getNextDate().getTime() + ' -> ' + this.next_collection.getNextDate().getTime());
			this.removeChild(this.current_collection);
			this.current_collection = this.next_collection;
			this.addChild(this.current_collection);
			setTimeout(playNextCollection, Math.max(0,this.current_collection.getNextDate().getTime() - new Date().getTime()));
		}

		public function resize():void
		{
			for (var i:uint=0; i<this.numChildren; i++)
			{
				SWCollection(this.getChildAt(i)).resize();
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