git fetch --tags
for /f "delims=" %%a in ('git rev-list --tags --max-count=1') do @SET rev=%%a
ECHO %rev%
for /f "delims=" %%a in ('git describe --tags %rev%') do @SET tag=%%a
ECHO %tag%
git checkout %tag%
