#!/bin/bash

WORK_DIR=`dirname ${0}`
. ${WORK_DIR}/screen.conf
. ${WORK_DIR}/screenlib.sh

LAYOUT_FILE=${MEDIA_DIR}/${1}.layout
l_kill_file=${CONTROL_DIR}/${1}.layout.kill
LAYOUT_LENGTH=${2}

OIFS=$IFS; IFS=' ;'

   firstline=1
   
   while read l
   do
      [[ $firstline -eq 1 ]] && firstline=0 && continue


      bundle_a=( ${l} )
      POS_X="${bundle_a[1]}"
      POS_Y="${bundle_a[2]}"
      DIMENSION="${bundle_a[3]}x${bundle_a[4]}"
      START_SEC="${bundle_a[5]}"
      STOP_SEC="${bundle_a[6]}"
      BUNDLE_UID="${bundle_a[0]}_${POS_X}_${POS_Y}"

      (
         sleep ${START_SEC}
         
         ${WORK_DIR}/bundle.player.sh ${bundle_a[@]}

         if [ "${STOP_SEC}" -gt 0 ]; then
            sleep $((STOP_SEC-START_SEC))
         else
            sleep $((LAYOUT_LENGTH-START_SEC))
         fi
         touch ${CONTROL_DIR}/${BUNDLE_UID}.bundle.kill
      ) &
      
   done < ${LAYOUT_FILE}

IFS=$OIFS


while [ ! -f "${l_kill_file}" ]
do
   sleep 1
done 


rm "${l_kill_file}"
date +"%c Exit layout player due to kill file: '${l_kill_file}'"


exit 0
