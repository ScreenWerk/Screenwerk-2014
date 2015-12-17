git checkout --force release
git pull
call npm update
@ECHO Enjoy latest ScreenWerk (beware of bugs)
start "SW Player 2014" /i nwjs
@ECHO Started ScreenWerk
exit 0
