## ScreenWerk player version for Statoil

### Installing
1. Open CMD in desired location :  

2. Run command:

    `git clone https://github.com/mitselek/Screenwerk.git --branch statoil --single-branch`  

### Add Task to autostart on logon from lockscreen, startup and sleep

1. Open `Task Scheduler`
2. Add new task to start `screenwerk.exe` on user logon   
   >Trigger 1 : On workstation unlock  
   >Trigger 2 : At log on  
   >Actions : open launcher.bat
