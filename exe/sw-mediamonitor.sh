#!/bin/bash -
cd `dirname $0`
. sw-script-header.sh

# for process in `ps -e | grep mediamonitor.sh | cut -d" " -f2` ; do kill $process; done;


# catch new files in INCOMING_MEDIA folder
echo "Watch ${_DIR_INCOMING_MEDIA}"
inotifywait -m --format '%T "%f" %e "%w"' --timefmt '%d/%m/%Y %H:%M:%S' \
            -e close_write -e moved_to \
            ${_DIR_INCOMING_MEDIA}/ | \
while read LINE
do
   echo "Catched ${LINE}"
   filename=`echo ${LINE} | cut -d"\"" -f2`
   
   echo "sw-media.create.sh \"${filename}\" &"
   ${_DIR_EXE}/sw-media.create.sh "${filename}" &
done &

# catch video files in SCREENS folder
echo "Watch ${_DIR_CONVERT}"
inotifywait -m --format '%T "%f" %e "%w"' --timefmt '%d/%m/%Y %H:%M:%S' \
            -e close_write -e moved_to \
            ${_DIR_CONVERT}/ | \
while read LINE
do
   echo "Catched ${LINE}"
   filename=`echo ${LINE} | cut -d"\"" -f2`

   echo "sw-media.convert.sh \"${filename}\" &"
   ${_DIR_EXE}/sw-media.convert.sh "${filename}" &
done &

exit 0
