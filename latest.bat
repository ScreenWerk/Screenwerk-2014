git fetch --tags
for /f "delims=" %%a in ('git rev-list --tags --max-count=1') do @set rev=%%a
for /f "delims=" %%a in ('git describe --tags %%rev%%') do @set tag=%%a
git checkout %%tag%%
