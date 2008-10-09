#!/bin/bash -
#for process in `ps -e | grep sw-mediamonitor | cut -d" " -f1` ; do echo $process; kill $process; done;
#killall sw-mediamonitor.sh

killall inotifywait
exit 0
