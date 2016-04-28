cd %~dp0
git checkout --force release
git pull
call npm update
@ECHO Enjoy latest ScreenWerk (beware of bugs)
call nwjs
@ECHO Started ScreenWerk
