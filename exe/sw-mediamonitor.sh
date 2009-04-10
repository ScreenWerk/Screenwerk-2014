#!/bin/bash -
cd `dirname $0`
. sw-script-header.sh

# for process in `ps -e | grep mediamonitor.sh | cut -d" " -f2` ; do kill $process; done;


#
# catch new files in INCOMING_MEDIA folder
#

date +"%c Watch ${_DIR_INCOMING_MEDIA}"
inotifywait -m -r --format '%f\"%w' --timefmt '%d/%m/%Y %H:%M:%S' \
            -e close_write -e moved_to \
            ${_DIR_INCOMING_MEDIA}/ | \
while read LINE
do
   filename=`echo ${LINE} | cut -d"\"" -f1`
   dirname=`echo ${LINE} | cut -d"\"" -f2`
   if [ "${dirname}" = "${_DIR_INCOMING_MEDIA}/" ]
   then
      media_owner=`ls -o "${_DIR_INCOMING_MEDIA}/${filename}" | cut -d" " -f3`
      customer_id=`${_DIR_EXE}/sw-customer.find_by_username.sh ${media_owner}`
      date +"%c Moving ${_DIR_INCOMING_MEDIA}/${filename} to ${_DIR_INCOMING_MEDIA}/${customer_id}/${filename}"
      mv "${_DIR_INCOMING_MEDIA}/${filename}" "${_DIR_INCOMING_MEDIA}/${customer_id}/${filename}"
      continue 1
   fi   

   customer_id=`dirname ${dirname}x | awk -F/ '{print $NF}'`

   date +"%c sw-media.create.sh \"${filename}\" \"${customer_id}\""
   ${_DIR_EXE}/sw-media.create.sh "${filename}" "${customer_id}"

   if [ $? -ne 0 ]
   then
      continue 1
   fi

   date +"%c sw-media.convert.sh \"${filename}\" \"${customer_id}\""
   ${_DIR_EXE}/sw-media.convert.sh "${filename}" "${customer_id}" &
      
done &
echo ----
echo

#
# catch video files in CONVERT folder
#

#echo "Watch ${_DIR_CONVERT}"
#inotifywait -m --format '%T "%f" %e "%w"' --timefmt '%d/%m/%Y %H:%M:%S' \
#            -e close_write -e moved_to \
#            ${_DIR_CONVERT}/ | \
#while read LINE
#do
#   #echo "== CONVERT == Catched ${LINE}"
#   filename=`echo ${LINE} | cut -d"\"" -f2`
#
#   #echo "sw-media.convert.sh \"${filename}\" &"
#   ${_DIR_EXE}/sw-media.convert.sh "${filename}" &
#done &


#
# catch all files in SCREENS folder
#

#echo "Watch ${_DIR_SCREENS}"
#inotifywait -m --format '%T "%f" %e "%w"' --timefmt '%d/%m/%Y %H:%M:%S' \
#            -e create \
#            ${_DIR_SCREENS}/ | \
#while read LINE
#do
#   echo "== SCREENS == Catched ${LINE}"
#   filename=`echo ${LINE} | cut -d"\"" -f2`
#   screen_id=`echo ${filename} | cut -d_ -f1`
#   echo "scp remotes@moos.ww.ee:${_DIR_SCREENS}/${filename} /mnt/swshare/" | tee -a /home/remotes/signals/${screen_id}
#   echo "ssh remotes@moos.ww.ee rm ${_DIR_SCREENS}/${filename}" | tee -a /home/remotes/signals/${screen_id}
#done &

exit 0
