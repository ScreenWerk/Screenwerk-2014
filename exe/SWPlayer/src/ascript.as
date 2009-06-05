

import eu.screenwerk.*;
import eu.screenwerk.components.*;
import eu.screenwerk.player.*;

import flash.events.KeyboardEvent;
import flash.filesystem.File;
import flash.filesystem.FileMode;
import flash.filesystem.FileStream;
import flash.system.System;
import flash.ui.Mouse;
import flash.utils.ByteArray;
import flash.utils.Timer;

import mx.controls.Alert;
import mx.core.Application;
import mx.events.FlexEvent;
import mx.graphics.ImageSnapshot;

private var _rc:Array = new Array();

private var _defined_screen_width:uint = 1680;
private var _defined_screen_height:uint = 1050;
private var _screen_id:uint = 35;
private var _sw_screen:SWScreen;

public var _x_coef:Number;
public var _y_coef:Number;
private var _is_fullscreen:Boolean = true;
private var _timer:Timer;
private var _swagent:SWAgent;

private var home_dir:File = File.userDirectory;
public var sw_dir:File = home_dir.resolvePath('screenwerk');
public var structure_dir:File = sw_dir.resolvePath('structure');
public var media_dir:File = sw_dir.resolvePath('media');


public function init():void
{
	Application.application.log(this.className + '.init ' + 'Start');
	Application.application.stage.displayState = StageDisplayState.FULL_SCREEN_INTERACTIVE;
	this._is_fullscreen = true;

	// make sure directories exist
	this.sw_dir.createDirectory(); 
	this.structure_dir.createDirectory();
	this.media_dir.createDirectory();
	
	this._swagent = new SWAgent();
	this._swagent.addEventListener(FlexEvent.VALID, playValid);
	this._swagent.addEventListener(FlexEvent.UPDATE_COMPLETE, playUpdated);
	
		
//	stage.addEventListener(KeyboardEvent.KEY_UP, toggleFullscreen, false, 0, true);
//	stage.dispatchEvent(new KeyboardEvent(KeyboardEvent.KEY_UP));

	var screenshotTimer:Timer = new Timer(3600*1000);
	screenshotTimer.addEventListener(TimerEvent.TIMER, takeScreenshot);
	screenshotTimer.start();

}

private function playValid(flex_event:FlexEvent):void
{
	if (this._sw_screen == null)
	{
		this.play();
	}
}

private function playUpdated(flex_event:FlexEvent):void
{
	if (this._sw_screen != null)
	{
		this.removeChild(this._sw_screen);
	}
	this.play();
}

private function play():void
{
	Mouse.hide();

	trace (' xcoef:'+this._x_coef+'='+this.width+'/'+this._defined_screen_width + '; ycoef:'+this._y_coef+'='+this.height+'/'+this._defined_screen_height+'.');

	this._sw_screen = new SWScreen();
	this._sw_screen.x = 0;
	this._sw_screen.y = 0;
	this._sw_screen.width = this.width;
	this._sw_screen.height = this.height;
	this.addChild(this._sw_screen);
}

public function readComponentData(filename:String):Array
{
	var component_file:File = this.structure_dir.resolvePath(filename);
	var component_string:String = this.readFileContents(component_file);
	var component_split:Array = component_string.split("\n");
	component_split.shift();
	trace( "Component data: " + component_split.toString() ); 
	return component_split;
}

public function readFileContents(file:File):String
{
//	trace ("Reading from " + file.nativePath);

	var file_contents:String = "";
	
	var fileStream:FileStream = new FileStream();
	try {
		fileStream.open(file, FileMode.READ);
		file_contents = fileStream.readUTFBytes(fileStream.bytesAvailable);
		fileStream.close();
	}
	catch(errObject:Error) {
		Alert.show("Please make sure You have data file available at \n"+file.nativePath,
		"Missing data file",4,null,NativeApplication.nativeApplication.exit);
		Application.application.exit();
	}
	return file_contents;
}


private function stopResizeListeners():void
{
	stage.removeEventListener(KeyboardEvent.KEY_UP, toggleFullscreen);
}

private function toggleFullscreen(event:KeyboardEvent):void
{
	event.stopPropagation();
	
	if(this._is_fullscreen) 
	{
		Application.application.stage.displayState = StageDisplayState.NORMAL;
		this._is_fullscreen = false;
	}
	else
	{
		Application.application.stage.displayState = StageDisplayState.FULL_SCREEN_INTERACTIVE;
		this._is_fullscreen = true;
	}

	this.validateNow();

	this._x_coef = this.width/this._defined_screen_width;
	this._y_coef = this.height/this._defined_screen_height;

	for (var i:uint=0; i<this.numChildren; i++)
	{
		SWScreen(this.getChildAt(i)).resize();
		this.getChildAt(i).width = this.width;
		this.getChildAt(i).height = this.height;
	}

	this.validateNow();
}

public function log(message:String):void
{
	var logstring:String = ''+new Date().toString() + ' ' + System.totalMemory + ' - ' + message;
	trace ("Log message: " + logstring );

	var log_file:File = this.sw_dir.resolvePath('screenlog');	
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

private function takeScreenshot(event:TimerEvent = null):void
{
    log( 'Shooting screen ...' );	
	var imageSnap:ImageSnapshot = ImageSnapshot.captureImage(this);
	var imageByteArray:ByteArray = imageSnap.data as ByteArray;

	var outFile:File = this.sw_dir.resolvePath('screenshot');
    var outStream:FileStream = new FileStream();
    // open output file stream in WRITE mode
    outStream.open(outFile, FileMode.WRITE);
    // write out the file
    outStream.writeBytes(imageByteArray, 0, imageByteArray.length);
    // close it
    outStream.close();
    log( 'Screenshot ready at ' + outFile.nativePath );	
}

