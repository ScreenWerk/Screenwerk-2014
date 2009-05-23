package eu.screenwerk
{
	import com.adobe.crypto.MD5;
	
	import flash.desktop.NativeApplication;
	import flash.events.Event;
	import flash.events.HTTPStatusEvent;
	import flash.events.IEventDispatcher;
	import flash.events.IOErrorEvent;
	import flash.events.ProgressEvent;
	import flash.events.SecurityErrorEvent;
	import flash.filesystem.File;
	import flash.filesystem.FileMode;
	import flash.filesystem.FileStream;
	import flash.net.URLLoader;
	import flash.net.URLLoaderDataFormat;
	import flash.net.URLRequest;
	import flash.utils.ByteArray;
	import flash.utils.clearTimeout;
	import flash.utils.setTimeout;
	
	import mx.controls.Alert;
	import mx.core.Application;
	import mx.events.FlexEvent;
	import mx.messaging.messages.HTTPRequestMessage;
	import mx.rpc.events.FaultEvent;
	import mx.rpc.events.ResultEvent;
	import mx.rpc.http.HTTPService;
	
	public class SWAgent extends Application
	{
		public var md5_dir:File = Application.application.sw_dir.resolvePath('MD5');
		public var tmp_dir:File = Application.application.sw_dir.resolvePath('tmp');
		public var structure_dir:File = Application.application.structure_dir;
		public var media_dir:File = Application.application.media_dir;

		private var _get_list_controller:String = 'http://www.screenwerk.eu/player/get_list/';
		private var _get_file_controller:String = 'http://www.screenwerk.eu/player/get_file/';

		private var _listing_service:HTTPService = new HTTPService();
		private var _listing_a:Array = new Array();
		private var _next_sync_timeout_id:uint;
		private var _sync_interval_ms:uint = 60 * 1000;
		
		private var _files_to_sync:Array = new Array();
		private var _files_to_move:Array = new Array();
		private var _current_download:File;
		private var _bytes_to_download:uint = 0;
		
		private var _media_types_a:Array = new Array('VIDEO','IMAGE','PDF','SWF','URL','HTML');
		private var _binary_media_types_a:Array = new Array('VIDEO','IMAGE','PDF','SWF','HTML');
		public var _screen_md5_string:String = 'guest screen';
		public var _player_md5_string:String = '';
		
		public function SWAgent()
		{
			this._listing_service.addEventListener(FaultEvent.FAULT, listingFault);
			this._listing_service.addEventListener(ResultEvent.RESULT, listingResult);
			
//			this.checkMD5OnDir(this.structure_dir);
//			this.checkMD5OnDir(this.media_dir);
		
			this.md5_dir.createDirectory();
			this.tmp_dir.createDirectory();

			this.setScreenMD5();
		}

		private function checkMD5OnDir(MD5_dir:File):void
		{
			MD5_dir.createDirectory();
			var dirNodes:Array = MD5_dir.getDirectoryListing();
			for (var i:uint=0;i<dirNodes.length;i++)
			{
				var _file:File = MD5_dir.resolvePath(dirNodes[i].name);
				var _fileMD5:String = this.getFileMD5(_file);
				Application.application.log ("MD5 for " + _file.nativePath + ": " + _fileMD5 );
			}
		}
		
		
		private function synchronise():void
		{
			clearTimeout(this._next_sync_timeout_id);
		
			this._listing_service.url = this._get_list_controller + this._screen_md5_string + '/';
			this._listing_service.method = HTTPRequestMessage.GET_METHOD;
			this._listing_service.send();
		
		}
		
		private function listingResult(event:ResultEvent):void {
		    var _result:String = event.result.toString();
			var _result_split:Array = _result.split("\n");
			while ( _result_split.length > 0 )
			{
				var _part:String = _result_split.shift();
				if (_part == '' ) continue;
				Application.application.log (this.className + '.listingResult. ' + _part);
				
		
				var _file_split:Array = _part.split(';');
				var _file_name:String = _file_split[0];
				var _file_md5:String = _file_split[1];
				var _file_size:uint = _file_split[2];
				_file_split = _file_name.split('.');
				var _file_ext:String = _file_split[1];
				
				var _file:File;
				if ( this._media_types_a.indexOf(_file_ext) == -1 )
				{
					_file = Application.application.structure_dir.resolvePath(_file_name);
				}
				else
				{
					_file = Application.application.media_dir.resolvePath(_file_name);
				}
				
				try
				{
					var _file_size_local:uint = _file.size;
				}
				catch(errObject:Error) {
					Application.application.log(this.className + '.listingResult. ' + errObject.toString()+
					"Problem with file "+_file.nativePath);
				}
				
				if (_file_size == _file_size_local)
				{
					var _file_md5_local:String = this.getFileMD5(_file);
				}

				if (_file_size != _file_size_local || _file_md5 != _file_md5_local)
				{
					this._files_to_sync.push(this.tmp_dir.resolvePath(_file_name));
					this._bytes_to_download += _file_size;
					Application.application.log(this.className + '.listingResult. ' + 'Scheduled ' + _file.name + ' for syncronization. Remote size ' +_file_size + ' should match local size ' + _file_size_local + ' and remote md5 ' + _file_md5 + ' should match local md5 ' + _file_md5_local + '.');
				}
			}
			
			if (this._files_to_sync.length > 0)
			{
				this._current_download = this._files_to_sync.pop();
				this.dispatchEvent(new FlexEvent(FlexEvent.INVALID));
				this.download(this._current_download.name);
			}
			else
			{
				this._next_sync_timeout_id = setTimeout(synchronise, this._sync_interval_ms);
				this.dispatchEvent(new FlexEvent(FlexEvent.VALID));
			}
		}
		
		
/*  */ 
		private function download(_file_name:String):void
		{
			var _remote_url:String = this._get_file_controller + this._screen_md5_string + '/' + this._player_md5_string + '/' + _file_name;
			trace("download: " + _remote_url);

			var _loader:URLLoader = new URLLoader();
			this.configureListeners(_loader);
			
			var _file_split:Array = _file_name.split('.');
			var _file_ext:String = _file_split[1];
			if ( this._binary_media_types_a.indexOf(_file_ext) == -1 )
			{
				_loader.dataFormat = URLLoaderDataFormat.TEXT;
			}
			else
			{
				_loader.dataFormat = URLLoaderDataFormat.BINARY;
			}
			
			var _request:URLRequest = new URLRequest(_remote_url);
			try {
                _loader.load(_request);
            } catch (error:Error) {
                trace("Unable to load requested document.");
            }
		}
 
        private function configureListeners(dispatcher:IEventDispatcher):void {
            dispatcher.addEventListener(Event.COMPLETE, completeHandler);
            dispatcher.addEventListener(Event.OPEN, openHandler);
            dispatcher.addEventListener(ProgressEvent.PROGRESS, progressHandler);
            dispatcher.addEventListener(SecurityErrorEvent.SECURITY_ERROR, securityErrorHandler);
            dispatcher.addEventListener(HTTPStatusEvent.HTTP_STATUS, httpStatusHandler);
            dispatcher.addEventListener(IOErrorEvent.IO_ERROR, ioErrorHandler);
        }
        private function completeHandler(event:Event):void {
            var loader:URLLoader = URLLoader(event.target);
            
			var _fileStream:FileStream = new FileStream();
			try {
				_fileStream.open(this._current_download, FileMode.WRITE);
				switch (loader.dataFormat)
				{
					case URLLoaderDataFormat.TEXT:
						_fileStream.writeUTFBytes(loader.data);
						break;
					case URLLoaderDataFormat.BINARY:
						_fileStream.writeBytes(loader.data, 0, loader.bytesTotal);
						break;					
				}
				_fileStream.close();
	            trace("completeHandler: " + this._current_download.nativePath + ' ' + this._current_download.size + ' bytes.');
	            this.setFileMD5(this._current_download);
	            this._bytes_to_download -= this._current_download.size;
				this._files_to_move.push(this._current_download);
			}
			catch(errObject:Error) {
				Application.application.log(this.className + '. ' + errObject.message);
			}

			if (this._files_to_sync.length > 0)
			{
				this._current_download = this._files_to_sync.pop();
				this.download(this._current_download.name);
			}
			else
			{
				while (this._files_to_move.length > 0)
				{
					this._current_download = this._files_to_move.pop();

					var _target_file:File;
					var _file_split:Array = this._current_download.name.split('.');
					if ( this._media_types_a.indexOf(_file_split[1]) == -1 )
					{
						_target_file = Application.application.structure_dir.resolvePath(this._current_download.name);
					}
					else
					{
						_target_file = Application.application.media_dir.resolvePath(this._current_download.name);
					}
					this._current_download.moveTo(_target_file,true);
				}
				this._next_sync_timeout_id = setTimeout(synchronise, this._sync_interval_ms);
				this.dispatchEvent(new FlexEvent(FlexEvent.UPDATE_COMPLETE));
			}
        }
        private function openHandler(event:Event):void {
            trace("openHandler: " + event);
        }
        private function progressHandler(event:ProgressEvent):void {
            Application.application.progresslabel.text = this._bytes_to_download - event.bytesLoaded;
        }
        private function securityErrorHandler(event:SecurityErrorEvent):void {
            trace("securityErrorHandler: " + event);
        }
        private function httpStatusHandler(event:HTTPStatusEvent):void {
            trace("httpStatusHandler: " + event);
        }
        private function ioErrorHandler(event:IOErrorEvent):void {
            trace("ioErrorHandler: " + event);
        }
/*  */

		
		private function listingFault(event:FaultEvent):void {
		    var faultstring:String = event.fault.faultString;
		    Application.application.log(faultstring);
		    Alert.show(faultstring,"HTTP fault",4,null,NativeApplication.nativeApplication.exit);
		
			this._next_sync_timeout_id = setTimeout(synchronise, this._sync_interval_ms);
		}
		
		
		
		
		private function getFileMD5(file:File):String
		{
			var _md5_file:File = this.md5_dir.resolvePath(file.name + '.md5');
			if ( _md5_file.exists )
			{
				return Application.application.readFileContents(_md5_file);
			}
			else
			{
				return this.setFileMD5(file);
			}
		}
		
		private function setFileMD5(file:File):String
		{
			var _md5_hash:String = '';
		
			var _fileStream:FileStream = new FileStream();
			try {
				_fileStream.open(file, FileMode.READ);
				var fileBytes:ByteArray = new ByteArray();
				_fileStream.readBytes( fileBytes );
				_md5_hash = MD5.hashBinary(fileBytes);
				_fileStream.close();
			}
			catch(errObject:Error) {
				Application.application.log(errObject.toString()+
				"Problem with \n"+file.nativePath);
			}
		
			var _md5_file:File = this.md5_dir.resolvePath(file.name + '.md5');
			_fileStream = new FileStream();
			try {
				_fileStream.open(_md5_file, FileMode.WRITE);
				_fileStream.writeUTFBytes(_md5_hash);
				_fileStream.close();
			}
			catch(errObject:Error) {
				this.log(errObject.message);
			}
		
			return _md5_hash;
		}
			
		private function setScreenMD5():void
		{
			var md5_source_file:File = File.applicationDirectory.resolvePath('screen.md5');
			
			var fileStream:FileStream = new FileStream();

			if (!md5_source_file.exists)
			{
				Alert.show("Your screen signature is missing. Download new player.",
							"Missing MD5 signature file",4,null,NativeApplication.nativeApplication.exit);
			}
							
			if (md5_source_file.size != 33)
			{
				Alert.show("Your screen signature is c0rrupted (" + md5_source_file.size + "bytes). Download new player.",
							"Missing MD5 signature file",4,null,NativeApplication.nativeApplication.exit);
			}

			try {
				fileStream.open(md5_source_file, FileMode.READ);
				this._screen_md5_string = fileStream.readUTFBytes(32);
				fileStream.close();
			} catch(errObject:Error) {
				Alert.show("Unexpected error with screen signature file. " + errObject.message + "\nDownload new player.",
				"Unexpected error",4,null,NativeApplication.nativeApplication.exit);
			}
			
			this.setPlayerMD5();
			
			this._next_sync_timeout_id = setTimeout(synchronise, this._sync_interval_ms);
			this.synchronise();
		}

		private function setPlayerMD5():void
		{
			var md5_file:File = Application.application.sw_dir.resolvePath('player.md5');
			var fileStream:FileStream = new FileStream();
			
			if (md5_file.exists == false || md5_file.size != 32)
			{
				try {
					this._player_md5_string = MD5.hash(new Date().getMilliseconds().toString());
					fileStream.open(md5_file, FileMode.WRITE);
					fileStream.writeUTFBytes(this._player_md5_string);
					fileStream.close();
				} catch(errObject:Error) {
					Alert.show('MD5 signature file for player not accessible.\n'+md5_file.nativePath,
					'File not accessible',4,null,NativeApplication.nativeApplication.exit);
				}
			}
			
			try {
				fileStream.open(md5_file, FileMode.READ);
				this._player_md5_string = fileStream.readUTFBytes(32);
				fileStream.close();
			} catch(errObject:Error) {
				Alert.show('MD5 signature file for player not readable.\n'+md5_file.nativePath,
				'File not accessible',4,null,NativeApplication.nativeApplication.exit);
			}
		}
		
	}
}