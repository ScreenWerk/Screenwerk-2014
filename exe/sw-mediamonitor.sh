#!/bin/bash -
cd `dirname $0`
. sw-script-header.sh

# for process in `ps -e | grep mediamonitor.sh | cut -d" " -f2` ; do kill $process; done;


#
# catch new files in INCOMING_MEDIA folder
#

echo "Watch ${_DIR_INCOMING_MEDIA}"
inotifywait -m --format '%T "%f" %e "%w"' --timefmt '%d/%m/%Y %H:%M:%S' \
            -e close_write -e moved_to \
            ${_DIR_INCOMING_MEDIA}/ | \
while read LINE
do
   echo "== INCOMING == Catched ${LINE}"
   filename=`echo ${LINE} | cut -d"\"" -f2`
   
   echo "sw-media.create.sh \"${filename}\" &"
   ${_DIR_EXE}/sw-media.create.sh "${filename}" &
done &


#
# catch video files in CONVERT folder
#

echo "Watch ${_DIR_CONVERT}"
inotifywait -m --format '%T "%f" %e "%w"' --timefmt '%d/%m/%Y %H:%M:%S' \
            -e close_write -e moved_to \
            ${_DIR_CONVERT}/ | \
while read LINE
do
   echo "== CONVERT == Catched ${LINE}"
   filename=`echo ${LINE} | cut -d"\"" -f2`

   echo "sw-media.convert.sh \"${filename}\" &"
   ${_DIR_EXE}/sw-media.convert.sh "${filename}" &
done &


#
# catch all files in SCREENS folder
#

echo "Watch ${_DIR_SCREENS}"
inotifywait -m --format '%T "%f" %e "%w"' --timefmt '%d/%m/%Y %H:%M:%S' \
            -e create \
            ${_DIR_SCREENS}/ | \
while read LINE
do
   echo "== SCREENS == Catched ${LINE}"
   filename=`echo ${LINE} | cut -d"\"" -f2`
   screen_id=`echo ${filename} | cut -d_ -f1`
   echo "scp remotes@moos.ww.ee:${_DIR_SCREENS}/${filename} /mnt/swshare/" | tee /home/remotes/signals/${screen_id}
done &
exit 0
