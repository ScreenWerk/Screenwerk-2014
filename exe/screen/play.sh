#!/bin/bash

. /root/screen.conf
MONITORASPECT=`xwininfo -root | grep geometry | cut -d" " -f4 | cut -d+ -f1 | tr x "/"`

#SCREEN_ID=29
TODAY=`date +'%Y%m%d'`
LOGFILE=${SCREEN_ID}_player.log
echo "" > ${LOGFILE}

date +'%c starting up' >> ${LOGFILE}

cat /mnt/swshare/${SCREEN_ID}_${TODAY}.events | \
while read event
do
  event_a=($event)

  event_name=${event_a[1]}
  event_id=${event_a[2]}
  date +"%H:%M:%S E${event_id}: ${event}" >> ${LOGFILE}

  #Continue, if event is Stop event
  if [ "${event_name}" = "stop" ]
  then
    if [ ${event_pid_a[${event_id}]} ]
    then
      if [ `ps -ef | grep ${event_pid_a[${event_id}]} | wc -l` -eq 1 ]
      then
        date +"%H:%M:%S E${event_id}: killing PID ${event_pid_a[${event_id}]}" >> ${LOGFILE}
        kill ${event_pid_a[${event_id}]}
      else
        date +"%H:%M:%S E${event_id}: PID ${event_pid_a[${event_id}]} allready stopped" >> ${LOGFILE}
      fi
      date +"%H:%M:%S E${event_id}: skip" >> ${LOGFILE}
    #else
    fi
    continue
  fi

  # Continue, if stop time in past.
  stop_time=${event_a[9]}
  if [ `echo ${stop_time}|cut -c1,2,4,5,7,8` -lt `date +'%H%M%S'` ]
  then
    date +"%H:%M:%S E${event_id}: skip" >> ${LOGFILE}
    continue
  fi

  start_time=${event_a[0]}
  media_id=${event_a[3]}
  media_type=${event_a[4]}
  W=${event_a[5]}
  H=${event_a[6]}
  X=${event_a[7]}
  Y=${event_a[8]}

  # Play right now, if start time in past.
  if [ `echo ${start_time}|cut -c1,2,4,5,7,8` -lt `date +'%H%M%S'` ]
  then
    /usr/bin/mplayer \
      -monitoraspect ${MONITORASPECT} \
      -geometry ${W}x${H}+${X}+${Y} \
      -loop 1 \
      /mnt/swshare/${SCREEN_ID}_${media_id}_${W}x${H}.video \
      2>&1 >/dev/null && date +"%H:%M:%S E${event_id}: Finished" >> ${LOGFILE} &

    ppid=${!}
    `ps -eo pid,ppid | grep ${ppid}` >> ${LOGFILE}
    event_pid_a[${event_id}]=`ps -eo pid,ppid | grep ${ppid} | tail -1 | cut -d" " -f1`
    date +"%H:%M:%S E${event_id}: Started with PID '${event_pid_a[${event_id}]}'" >> ${LOGFILE}
      
    continue
  fi


  # If start in future, lets sleep a bit
  d_H="$((10#`echo $start_time|cut -c1-2`-10#`date +'%H'`))"
  d_M="$((10#`echo $start_time|cut -c4-5`-10#`date +'%M'`))"
  d_S="$((10#`echo $start_time|cut -c7-8`-10#`date +'%S'`))"

  delay=$(($d_H*3600+$d_M*60+$d_S+2))
  date +"%H:%M:%S E${event_id}: Sleep for ${delay} seconds" >> ${LOGFILE}
  sleep $delay

  /usr/bin/mplayer \
    -monitoraspect ${MONITORASPECT} \
    -geometry ${W}x${H}+${X}+${Y} \
    -loop 1 \
    /mnt/swshare/${SCREEN_ID}_${media_id}_${W}x${H}.video \
    2>&1 >/dev/null && date +"%H:%M:%S E${event_id}: Finished" >> ${LOGFILE} &

  ppid=${!}
  `ps -eo pid,ppid | grep ${ppid}` >> ${LOGFILE}
  event_pid_a[${event_id}]=`ps -eo pid,ppid | grep ${ppid} | tail -1 | cut -d" " -f1`
  date +"%H:%M:%S E${event_id}: Started with PID '${event_pid_a[${event_id}]}'" >> ${LOGFILE}
  ps -ef | grep mplay >> ${LOGFILE}

done # >> /mnt/swshare/${SCREEN_ID}_events.log # | dwm

# . ${0} # uncomment this, if You like to restart the player

exit 0

#/usr/bin/mplayer -monitoraspect ${MONITORASPECT} -geometry 321:241 /mnt/swshare/154327.flv -loop 0 2>&1 >/dev/null &

