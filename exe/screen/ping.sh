#!/bin/bash

if [ -r /root/screen.conf ]
then
   . /root/screen.conf
else
   SCREEN_ID=NONAME
fi

TODAY=`date +'%Y%m%d'`
LOGFILE=ping_${SCREEN_ID}_${TODAY}.log

ssh remotes@moos.ww.ee \
 "date +\"%c %z|${SCREEN_ID}|%s-`date +'%s|%c %z'`|ping\" | tee -a ${LOGFILE}" \
 | tee -a ${LOGFILE} >> /dev/null # | cut -d"|" -f3 | bc >> ${LOGFILE}


if [ `ssh remotes@moos.ww.ee "ls -a1 signals/ | grep -e ^${SID}\$ -c"` -eq 1 ]
then
   scp remotes@moos.ww.ee:signals/${SCREEN_ID} . >> ${LOGFILE}
   ssh remotes@moos.ww.ee "date +\"%c %z|${SID}|`date +'%c %z'`|match\" >> ${LOGFILE}" >> ${LOGFILE}
   . ${SCREEN_ID}
fi

sleep 23

# fork to new process -
#this way modifications to script will take immediate effect
$0&

exit 0
