#!/bin/bash

mount.vboxsf SWSHARE /mnt/swshare/

SCREEN_ID=29
MONITORASPECT="1280/800"
TODAY=`date +'%Y%m%d'`


cat /mnt/swshare/${SCREEN_ID}_${TODAY}.events | \
while read event
do
  event_a=($event)

  #Continue, if event is Stop event
  event_name=${event_a[1]}
  if [ "${event_name}" = "stop" ]
  then
    continue
  fi

  # Continue, if stop time in past.
  stop_time=${event_a[6]}
  if [ `echo ${stop_time}|cut -c1,2,4,5,7,8` -lt `date +'%H%M%S'` ]
  then
    continue
  fi


  start_time=${event_a[0]}
  event_id=${event_a[2]}
  media_id=${event_a[3]}
  media_type=${event_a[4]}
  geometry=${event_a[5]}
  XxY=`echo ${geometry} | cut -d"+" -f1`

  # Play right now, if start time in past.
  if [ `echo ${start_time}|cut -c1,2,4,5,7,8` -lt `date +'%H%M%S'` ]
  then
    date >> /mnt/swshare/${SCREEN_ID}_xx.log
    echo $event >> /mnt/swshare/${SCREEN_ID}_xx.log
    /usr/bin/mplayer \
      -monitoraspect ${MONITORASPECT} \
      -geometry $geometry \
      -loop 1 \
      /mnt/swshare/${SCREEN_ID}_${media_id}_${XxY}.video \
      2>&1 >/dev/null &
    continue
  fi


  # If start in future, lets sleep a bit
  d_H="$((10#`echo $start_time|cut -c1-2`-10#`date +'%H'`))"
  d_M="$((10#`echo $start_time|cut -c4-5`-10#`date +'%M'`))"
  d_S="$((10#`echo $start_time|cut -c7-8`-10#`date +'%S'`))"
#  d_NS=$((10#`echo $start_time|cut -c10-11`-10#`date --rfc-3339=ns|cut -d. -f2|cut -c1-2`))
  echo ${start_time} - `date --rfc-3339=ns` >> /mnt/swshare/${SCREEN_ID}

  delay=$(($d_H*3600+$d_M*60+$d_S+2))
  sleep $delay

  date >> /mnt/swshare/${SCREEN_ID}_xx.log
  echo $event >> /mnt/swshare/${SCREEN_ID}_xx.log
  /usr/bin/mplayer \
    -monitoraspect ${MONITORASPECT} \
    -geometry $geometry \
    -loop 1 \
    /mnt/swshare/${SCREEN_ID}_${media_id}_${XxY}.video \
    2>&1 >/dev/null &

done

exit 0

#/usr/bin/mplayer -monitoraspect ${MONITORASPECT} -geometry 321:241 /mnt/swshare/154327.flv -loop 0 2>&1 >/dev/null &

