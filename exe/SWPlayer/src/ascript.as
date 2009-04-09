

import eu.screenwerk.components.*;
import eu.screenwerk.player.*;

import flash.events.Event;
import flash.events.KeyboardEvent;
import flash.filesystem.File;
import flash.filesystem.FileMode;
import flash.filesystem.FileStream;

import mx.controls.Alert;
import mx.core.Application;

private var _defined_screen_width:uint = 1680;
private var _defined_screen_height:uint = 1050;
private var _screen_id:uint = 35;

public var _x_coef:Number;
public var _y_coef:Number;
private var is_fullscreen:Boolean = false;

private var home_dir:File = File.userDirectory;
public var sw_dir:File = home_dir.resolvePath('screenwerk');


public function init():void
{
	this.readRcParams();

	trace (' xcoef:'+this._x_coef+'='+this.width+'/'+this._defined_screen_width
	+ '; ycoef:'+this._y_coef+'='+this.height+'/'+this._defined_screen_height+'.');

 

	var sw_screen:SWScreen = new SWScreen(this._screen_id);
	this.addChild(sw_screen);
	sw_screen.x = 0;
	sw_screen.y = 0;
	sw_screen.width = this.width;
	sw_screen.height = this.height;
	
	stage.addEventListener(Event.RESIZE, onResize);
	stage.addEventListener(KeyboardEvent.KEY_DOWN, toggleFullscreen);
}

public function readComponentData(filename:String):Array
{
	var component_file:File = this.sw_dir.resolvePath(filename);
	var component_string:String = this.readFileContents(component_file);
	var component_split:Array = component_string.split("\n");
	trace( "Discarding 1st line: " + component_split.shift() ); // discard first line with column descriptors
	trace( "Component data: " + component_split.toString() ); 
	return component_split;
}

public function readFileContents(file:File):String
{
	trace ("Reading from " + file.nativePath);

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

private function readRcParams():void
{
	var config_file:File = this.sw_dir.resolvePath('screenrc');
	var config_string:String = this.readFileContents(config_file);

    var config_params:Array = config_string.split("\n");
    
	while ( config_params.length > 0 ) {
		var kvPair:String = config_params.shift();
		if (kvPair == "") continue;
		
		var index:uint;
        if ((index = kvPair.indexOf("=")) > 0)
        {
            var key:String = kvPair.substring(0,index);
            var value:String = kvPair.substring(index+1);
            config_params[key] = value;
        }
	}
	
	this._screen_id = config_params['screen_id'];
	this._defined_screen_width = config_params['screen_width'];
	this._defined_screen_height = config_params['screen_height'];

//	this.toggleFullscreen(null);
//	Application.application.stage.displayState = StageDisplayState.FULL_SCREEN_INTERACTIVE; 
//	this.width = this._defined_screen_width;
//	this.height = this._defined_screen_height;

	this._x_coef = this.width/this._defined_screen_width;
	this._y_coef = this.height/this._defined_screen_height;
    
}

private function onResize(event:Event = null):void
{
	if (event != null) event.stopPropagation();
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

private function toggleFullscreen(event:KeyboardEvent = null):void
{
   if (event != null) event.stopPropagation();
   
   if(this.is_fullscreen) 
   {
      stage.displayState = StageDisplayState.NORMAL;
      this.is_fullscreen = false;
   }
   else
   {
      try
      {
         Application.application.stage.displayState = StageDisplayState.FULL_SCREEN_INTERACTIVE;
         this.is_fullscreen = true;
      }
      catch(err:Error) 
      {
         trace("FULLSCREEN ERROR " + err);
      }
   }
   this.onResize(null);
}

public function log(message:String):void
{
	var logstring:String = '"'+new Date().toString() + '" ' + message;
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

