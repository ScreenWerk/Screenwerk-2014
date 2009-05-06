import com.adobe.crypto.MD5;

import flash.filesystem.File;
import flash.filesystem.FileMode;
import flash.filesystem.FileStream;
import flash.system.System;
import flash.utils.ByteArray;
import flash.utils.Timer;

import mx.controls.Alert;
import mx.core.Application;


private var _md5_string:String = "guest screen";


private var _rc:Array = new Array();

private var _defined_screen_width:uint = 1680;
private var _defined_screen_height:uint = 1050;
private var _screen_id:uint = 35;

public var _x_coef:Number;
public var _y_coef:Number;
private var _is_fullscreen:Boolean = true;
private var _timer:Timer;

private var home_dir:File = File.userDirectory;
public var sw_dir:File = home_dir.resolvePath('screenwerk');


public function init():void
{
	this.readMD5();
	this.checkMD5OnDir('media');
	this.checkMD5OnDir('structure');
}

private function checkMD5OnDir(dir:String):void
{
	var MD5_dir:File = this.sw_dir.resolvePath(dir);
	var dirNodes:Array = MD5_dir.getDirectoryListing();
	for (var i:uint=0;i<dirNodes.length;i++)
	{
		this.log('In '+dir+' we found '+dirNodes[i].name);
	}
}

public function getFileMD5(file:File):String
{
	trace ("Calculating MD5 from " + file.nativePath);
	var md5hash:String = '';
	
	var fileStream:FileStream = new FileStream();
	try {
		fileStream.open(file, FileMode.READ);
		var fileBytes:ByteArray;
		fileStream.readBytes( fileBytes );
		md5hash = MD5.hashBinary(fileBytes);
		fileStream.close();
	}
	catch(errObject:Error) {
		Alert.show("Please make sure You have data file available at \n"+file.nativePath,
		"Missing data file",4,null,NativeApplication.nativeApplication.exit);
		Application.application.exit();
	}
	return md5hash;
}


public function log(message:String):void
{
	var logstring:String = '"'+new Date().toString() + '" ' + System.totalMemory + ' - ' + message;
	trace ("Log message: " + logstring );

	var log_file:File = this.sw_dir.resolvePath('agent.log');	
	var fileStream:FileStream = new FileStream();
	try {
		fileStream.open(log_file, FileMode.APPEND);
		fileStream.writeUTFBytes(logstring + "\n");
		fileStream.close();
	}
	catch(errObject:Error) {
		Alert.show("Please make sure You have data file available at \n"+log_file.nativePath,
		"Missing data file",4,null,NativeApplication.nativeApplication.exit);
	}
}


private function readMD5():void
{
	var md5_file:File = this.sw_dir.resolvePath('screen.md5');
	
	var fileStream:FileStream = new FileStream();
	try {
		fileStream.open(md5_file, FileMode.READ);
		this._md5_string = fileStream.readUTFBytes(fileStream.bytesAvailable);
		fileStream.close();
	}
	catch(errObject:Error) {
		Alert.show("Running anonymous screen. Request new MD5 signature and save it to\n"+md5_file.nativePath,
		"Missing MD5 signature file",4,null,null);
	}
}

