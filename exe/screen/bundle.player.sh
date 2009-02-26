#!/bin/bash

WORK_DIR=`dirname ${0}`
. ${WORK_DIR}/screen.conf
. ${WORK_DIR}/screenlib.sh

BUNDLE_ID=${1}
BUNDLE_UID=${2}
POS_X=${3}
POS_Y=${4}
POS_Z=${5}
WIDTH=${6}
HEIGHT=${7}
B_DURATION=${8}

B_GEOMETRY=${WIDTH}x${HEIGHT}+${POS_X}+${POS_Y}
                
BUNDLE_FILE=${MEDIA_DIR}/${BUNDLE_ID}.bundle
b_kill_file=${CONTROL_DIR}/${BUNDLE_UID}.bundle.kill


OIFS=$IFS; IFS=' ;'

playable_medias=$((`cat "${BUNDLE_FILE}" | wc -l`-1))
while [ ! -f "${b_kill_file}" ]
do
   [[ "${playable_medias}" -eq 0 ]] && exit 1
   playable_medias=0

   firstline=1

   while read l
   do
      #echo "L: ${l}"
      if [ "${firstline}" -eq 1 ]; then
         firstline=0
         continue
      fi

      media_a=( ${l} )
      # id;length;type;frequency;appearances;importance;probability;valid_from_date;valid_to_date
      MEDIA_ID=${media_a[0]}
      M_DURATION=${media_a[1]}
      TYPE=${media_a[2]}
      FREQUENCY=${media_a[3]}
      APPEARANCES=${media_a[4]}
      IMPORTANCE=${media_a[5]}
      PROBABILITY=${media_a[6]}
      VALID_FROM=${layout_a[7]}
      VALID_TO=${layout_a[8]}

      MEDIA_UID=${BUNDLE_UID}_${MEDIA_ID}

      SIFS=$IFS; IFS='-'
         media_a[9]=`get_astro_JD ${VALID_FROM}`
         media_a[10]=`get_astro_JD ${VALID_TO}`
      IFS=$SIFS; 

      NOW_DATE=`date +'%-Y %-m %-d'`  # 2009 1 18
      NOW_JD=`get_astro_JD $NOW_DATE`
      [[ "${media_a[9]}" -gt "${NOW_JD}" ]] && continue
      [[ "${media_a[10]}" -lt "${NOW_JD}" ]] && [[ "${media_a[10]}" -ne "1721028" ]] && continue


      playable_medias=$((${playable_medias}+1))
      
      [[ ! -z "${m_kill_file}" ]] && touch "${m_kill_file}" # if we have kill file defined
      m_kill_file=${CONTROL_DIR}/${MEDIA_UID}.media.kill # define kill file for next iteration

      ${WORK_DIR}/media.player.sh ${MEDIA_ID} ${M_DURATION} ${TYPE} ${B_GEOMETRY} &
      sleepenh ${M_DURATION}

      [[ -f "${b_kill_file}" ]] && break 2
      
   done < ${BUNDLE_FILE}
done 

IFS=$OIFS

if [ -f "${b_kill_file}" ]; then
do
   rm "${b_kill_file}"
   date +"%c Exit bundle player due to kill file: '${b_kill_file}'"
else
   date +"%c Exit collection player without kill file: '${b_kill_file}'"
done
exit 0
