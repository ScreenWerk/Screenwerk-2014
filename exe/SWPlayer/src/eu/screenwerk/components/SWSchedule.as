package eu.screenwerk.components
{
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

		public function SWSchedule(id:uint)
		{
			this.sw_id = id;
			trace ("Create schedule " + this.sw_id);

			var schedule_file:File = Application.application.sw_dir.resolvePath(this.sw_id+'.schedule');
			var schedule_string:String = Application.application.readFileContents(schedule_file);
			var collectionstrings:Array = schedule_string.split("\n");
			var columns:String = collectionstrings.shift(); // discard first line with column descriptors

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
			this.current_collection.play();
			this.timeout_id = setTimeout(playNextCollection, this.current_collection.getNextDate().getTime() - new Date().getTime());
			
		}
		
		private function playNextCollection():void
		{
			clearTimeout(this.timeout_id);
			
			var schedule_file:File = Application.application.sw_dir.resolvePath(this.sw_id+'.schedule');
			var schedule_string:String = Application.application.readFileContents(schedule_file);
			var collectionstrings:Array = schedule_string.split("\n");
			var columns:String = collectionstrings.shift(); // discard first line with column descriptors

			var current_collection:SWCollection;
			
			var i:uint = 0;
			while ( collectionstrings.length > 0 )
			{
				var collectionstring:String = collectionstrings.shift();
				current_collection = new SWCollection(collectionstring);

				if (i==0)
				{
					this.next_collection = current_collection;
					continue;
				}
				
				if (current_collection.getNextDate().getTime() < this.next_collection.getNextDate().getTime() )
				{
					this.next_collection = current_collection;
				}

				i++;
			}

			this.current_collection.stop();
			this.current_collection = this.next_collection;
			this.current_collection.play();
			setTimeout(playNextCollection, this.current_collection.getNextDate().getTime() - new Date().getTime());
		}

	}
}