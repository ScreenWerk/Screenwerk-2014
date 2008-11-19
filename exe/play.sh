#!/bin/bash

. /root/screen.conf

#SCREEN_ID=29
MONITORASPECT="1440/900"
TODAY=`date +'%Y%m%d'`
LOGFILE=${SCREEN_ID}_player.log
echo "" > ${LOGFILE}

# exec dwm &
# iceweasel -geometry=720x450-0-0 google.com &
#iceweasel --geometry=720x450+0+0 google.com &


date +'%c starting up' >> ${LOGFILE}

cat /mnt/swshare/${SCREEN_ID}_${TODAY}.events | \
while read event
do
  event_a=($event)

  #Continue, if event is Stop event
  event_name=${event_a[1]}
  event_id=${event_a[2]}
  if [ "${event_name}" = "stop" ]
  then
    if [ ${event_pid_a[${event_id}]} ]
    then
      date +"%H:%M:%S ${event}" >> ${LOGFILE}
      if [ `ps -ef | grep ${event_pid_a[${event_id}]} | wc -l` -eq 1 ]
      then
        echo "- killing event ${event_id} with PID ${event_pid_a[${event_id}]}" >> ${LOGFILE}
        kill ${event_pid_a[${event_id}]}
      else
        echo "- event ${event_id} with pid ${event_pid_a[${event_id}]} allready stopped" >> ${LOGFILE}
      fi
    fi
    continue
  fi

  # Continue, if stop time in past.
  stop_time=${event_a[9]}
  if [ `echo ${stop_time}|cut -c1,2,4,5,7,8` -lt `date +'%H%M%S'` ]
  then
    date +"%H:%M:%S skip ${event}" >> ${LOGFILE}
    continue
  fi

  date +"%H:%M:%S ${event}" >> ${LOGFILE}

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
      2>&1 >/dev/null &
    event_pid_a[${event_id}]=$!
    echo "- Start with PID ${event_pid_a[${event_id}]}" >> ${LOGFILE}
      
    continue
  fi


  # If start in future, lets sleep a bit
  d_H="$((10#`echo $start_time|cut -c1-2`-10#`date +'%H'`))"
  d_M="$((10#`echo $start_time|cut -c4-5`-10#`date +'%M'`))"
  d_S="$((10#`echo $start_time|cut -c7-8`-10#`date +'%S'`))"

  delay=$(($d_H*3600+$d_M*60+$d_S+2))
  echo "- Sleep for ${delay} seconds" >> ${LOGFILE}
  sleep $delay

  /usr/bin/mplayer \
    -monitoraspect ${MONITORASPECT} \
    -geometry ${W}x${H}+${X}+${Y} \
    -loop 1 \
    /mnt/swshare/${SCREEN_ID}_${media_id}_${W}x${H}.video \
    2>&1 >/dev/null &
    event_pid_a[${event_id}]=$!
    date +"- %H:%M:%S Start with PID ${event_pid_a[${event_id}]}" >> ${LOGFILE}

done # >> /mnt/swshare/${SCREEN_ID}_events.log # | dwm

# . ${0} # uncomment this, if You like to restart the player

exit 0

#/usr/bin/mplayer -monitoraspect ${MONITORASPECT} -geometry 321:241 /mnt/swshare/154327.flv -loop 0 2>&1 >/dev/null &

