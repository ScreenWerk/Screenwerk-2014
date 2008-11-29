#!/bin/bash

. /root/screen.conf

TODAY=`date +'%Y%m%d'`
LOGFILE=ping_${SCREEN_ID}_${TODAY}.log
echo "" > ${LOGFILE}

while [ 1 ]
do

   ssh remotes@moos.ww.ee \
    "date +\"%c %z|${SID}|%s-`date +'%s|%c %z'`|ping\" | tee -a ${LOGFILE}" \
    | tee -a ${LOGFILE} | cut -d"|" -f3 | bc


   if [ `ssh remotes@moos.ww.ee "ls -a1 signals/ | grep -e ^${SID}\$ -c"` -eq 1 ]
   then
      scp remotes@moos.ww.ee:signals/${SCREEN_ID} . >> ${LOGFILE}
      ssh remotes@moos.ww.ee "date +\"%c %z|${SID}|`date +'%c %z'`|match\" >> ${LOGFILE}" >> ${LOGFILE}
      . ${SCREEN_ID}
   fi

   sleep 80

done

exit 0
