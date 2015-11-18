git fetch --tags
for /f "delims=" %%a in ('git rev-list --tags --max-count=1') do @SET rev=%%a
for /f "delims=" %%a in ('git describe --tags %rev%') do @SET tag=%%a
ECHO Running on release %tag% (commit %rev%)
git checkout %tag%
npm update
nwjs .
