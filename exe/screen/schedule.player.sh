#!/bin/bash


WORK_DIR=`dirname ${0}`
. ${WORK_DIR}/screen.conf
. ${WORK_DIR}/screenlib.sh

SCHEDULE_FILE=${MEDIA_DIR}/${1}.schedule

date +"== %c - Schedule for screen ${SCREEN_ID} =="
cat ${SCHEDULE_FILE}

set -f  # disable globbing. wildcards would be expanded otherwise

OIFS=$IFS; IFS=' ;'
   last_event < ${SCHEDULE_FILE}
IFS=$OIFS
echo "= First event ="
date +"%c Start collection ${LAST_EVENT[0]} for Julian Date ${LAST_EVENT[1]}, ${LAST_EVENT[2]}:${LAST_EVENT[3]}."

CURRENT_COLLECTION_ID=${LAST_EVENT[0]}

c_kill_file=${CONTROL_DIR}/${CURRENT_COLLECTION_ID}.collection.kill

${WORK_DIR}/collection.player.sh ${CURRENT_COLLECTION_ID} &
old_cpid=${!}

echo "= Events ="
while [ : ]
do
   OIFS=$IFS; IFS=' ;'
      next_event < ${SCHEDULE_FILE}
   IFS=$OIFS

   NOW_S=$((NOW_JD*3600*24+`date +'%-H'`*3600+`date +'%-M'`*60+`date +'%-S'`))
   NXT_S=$((NEXT_EVENT[1]*3600*24+NEXT_EVENT[2]*3600+NEXT_EVENT[3]*60))
   D=$((NXT_S-NOW_S))

#   echo "Sleep for $D seconds"
   sleep $D
   
   date +"%c Start collection ${NEXT_EVENT[0]} for Julian Date ${NEXT_EVENT[1]}, ${NEXT_EVENT[2]}:${NEXT_EVENT[3]}."

   touch ${c_kill_file}
   c_kill_file=${CONTROL_DIR}/${LAST_EVENT[0]}.collection.kill

   ${WORK_DIR}/collection.player.sh ${LAST_EVENT[0]} &
   new_cpid=${!}
   #( pstree -Alpa $old_cpid | cut -d, -f2 | cut -d' ' -f1 |  while read ps; do kill $ps; done ) &
   old_cpid=$new_cpid


done

echo "We should never reach here."
exit 0


  # echo '0 id           :'${cronline[0]}  # id
  # echo '1 minutes      :'${cronline[1]}  # minutes
  # echo '2 hours        :'${cronline[2]}  # hours
  # echo '3 days         :'${cronline[3]}  # days
  # echo '4 months       :'${cronline[4]}  # months
  # echo '5 weekdays     :'${cronline[5]}  # weekdays
  # echo '6 valid from   :'${cronline[6]}  # valid from
  # echo '7 valid to     :'${cronline[7]}  # valid to  
  # echo '8 JD valid from:'${cronline[8]}  # JD valid from
  # echo '9 JD valid to  :'${cronline[9]}  # JD valid to  
