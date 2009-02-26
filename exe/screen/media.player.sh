#!/bin/bash

WORK_DIR=`dirname ${0}`
. ${WORK_DIR}/screen.conf
. ${WORK_DIR}/screenlib.sh


MEDIA_ID=${1}
MEDIA_DURATION=${2}
MEDIA_TYPE=${3}
B_GEOMETRY=${4}

MEDIA_FILE=${MEDIA_DIR}/${1}.${3}

date +"%c ${MEDIA_FILE}"

m_kill_file=${CONTROL_DIR}/${1}.media.kill

case ${MEDIA_TYPE} in

video)
   /usr/bin/mplayer \
      -monitoraspect ${MONITORASPECT} \
      -geometry ${B_GEOMETRY} \
      -loop 1 \
      ${MEDIA_FILE} \
      2>&1 >/dev/null &

   pid=${!}
   ;;

image)
   ;;

url)
   ;;

html)
   ;;

*)
   echo "Unknown media type '${MEDIA_TYPE}'. Stopping media '${MEDIA_ID}'"
   exit 1
esac

sleepenh ${MEDIA_DURATION} 2>&1 > /dev/null
kill ${pid}

exit 0
