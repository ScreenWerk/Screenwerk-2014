## ScreenWerk player version that starts on secondary screen and can be set as screensaver. It has no icon on taskbar (closing can be done when player has focus and `ALT+F4` is pressed)

### Installing
1. Download Screenwerk:  

  https://github.com/mitselek/Screenwerk/archive/maxima.zip  
  Extract to desired folder

2. First initialization (create media folder and screen UUID)

    In the extracted folder start `screenwerk.exe`  
    It creates `ScreenWerk-2014` folder automatically (popup with that info appears) under `C:\Users\[USERNAME]\`  
    On the second start it asks for the screen ID and password, to create nessesary `*.uuid` file

### Set as screensaver

1. Right click on `screenwerk.scr` in the extracted folder and select `Install` to set it as screensaver (screenwerk starts automatically when `Install` is clicked. It can be closed (`ALT + F4`))
2. Adjust the time and logon screen setting


### Add Task to autostart on logon from lockscreen, startup and sleep

1. Open `Task Scheduler`
2. Add new task to start `screenwerk.exe` on user logon   
   >Trigger 1 : On workstation unlock  
   >Trigger 2 : At log on  
   >Actions : open screenwerk.exe

### Add exception for windows to enable screensaver when video is playing (32bit)
1. Open elevated `CMD` (run as Administrator)
2. Run the command:
>` powercfg /requestsoverride process nw.exe display`

3. Close the `CMD` and restart player
