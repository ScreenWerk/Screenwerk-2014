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

		private var SWChilds:Array = new Array;

		public function SWSchedule(id:uint)
		{
			this.sw_id = id;
			
			this.addEventListener(Event.ADDED, play, false, 0, true);
			Application.application.log(this.className + '.' + this.className + ': ' + this.sw_id );
		}
		
		private function play(event:Event):void
		{
			event.stopPropagation();
			this.removeEventListener(Event.ADDED, play);
			this.addEventListener(Event.REMOVED, stop, false, 0, true);

			Application.application.log(this.className + '.play: ' + 'Play schedule ' + this.sw_id + ", " + event.currentTarget.toString());
				
			var collectionstrings:Array = Application.application.readComponentData(this.sw_id+'.schedule');

			var _collection:SWCollection;
			
			var i:uint = 0;
			while ( collectionstrings.length > 0 )
			{
				var collectionstring:String = collectionstrings.shift();
				if (collectionstring == '') continue;
				
				if (this.SWChilds[collectionstring] == null)
				{
					this.SWChilds[collectionstring] = new SWCollection(collectionstring);
					Application.application.log(this.className + '.play: ' + 'Collection ' + this.SWChilds[collectionstring].sw_id + " loaded.");
				}
				else
				{
					this.SWChilds[collectionstring].setLastDate();
					this.SWChilds[collectionstring].setNextDate();
				}
	
				_collection = this.SWChilds[collectionstring];

				if (i==0)
				{
					this.current_collection = _collection;
					continue;
				}
				
				if (_collection.lastDate.getTime() > this.current_collection.lastDate.getTime() )
				{
					this.current_collection = _collection;
				}

				i++;
			}

			this.addChild(this.current_collection);
			var _now:Number = new Date().getTime();

			var timeout_msec:Number = this.current_collection.nextDate.getTime() - _now;
			Application.application.log(this.className + '.play: ' 
				+ 'Time from collection start - ' + uint((_now - this.current_collection.lastDate.getTime())/1000) + ' seconds, '
				+ 'time till next collection - ' + uint(timeout_msec/1000) + ' seconds.');
			this.timeout_id = setTimeout(playNextCollection, timeout_msec);
		}

		private function stop(event:Event):void
		{
			event.stopPropagation();
			this.removeEventListener(Event.REMOVED, stop);
			
			Application.application.log(this.className + '.stop: ' + "Stop schedule " + this.sw_id + ", " + event.currentTarget.toString());
				
			while (this.numChildren>0)
			{
				this.removeChildAt(0);
			}

			this.current_collection = null; // TODO: remove this?
		}
		
		private function playNextCollection():void
		{
			clearTimeout(this.timeout_id);
			
			var _collection:SWCollection;
			
			var collectionstrings:Array = Application.application.readComponentData(this.sw_id+'.schedule');
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
				
				if (_collection.nextDate.getTime() < this.next_collection.nextDate.getTime() )
				{
					this.next_collection = _collection;
				}

				i++;
			}

			var _now_time:Number = new Date().getTime();

			this.removeChild(this.current_collection);
			this.current_collection = this.next_collection;
			this.addChild(this.current_collection);
			this.timeout_id = setTimeout(playNextCollection, Math.max(0,this.current_collection.nextDate.getTime() - _now_time));
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