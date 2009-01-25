#!/bin/bash

WORK_DIR=`dirname ${0}`
. ${WORK_DIR}/screen.conf
. ${WORK_DIR}/screenlib.sh

COLLECTION_FILE=${MEDIA_DIR}/${1}.collection
c_kill_file=${CONTROL_DIR}/${1}.collection.kill

OIFS=$IFS; IFS=' ;'

playable_layouts=$((`cat "${COLLECTION_FILE}" | wc -l`-1))
while [ ! -f "${c_kill_file}" ]
do
   [[ "${playable_layouts} -eq 0" ]] && exit 1
   playable_layouts=0
   
   while read l
   do
      if [ $firstline -eq 1 ]; then
         firstline=0
         continue
      fi

      layout_a=( ${l} )
      LAYOUT_ID=${layout_a[0]}
      LENGTH=${layout_a[1]}
      VALID_FROM=${layout_a[4]}
      VALID_TO=${layout_a[5]}

      SIFS=$IFS; IFS='-'
         layout_a[8]=`get_astro_JD ${VALID_FROM}`
         layout_a[9]=`get_astro_JD ${VALID_TO}`
      IFS=$SIFS; 

      NOW_DATE=`date +'%-Y %-m %-d'`  # 2009 1 18
      NOW_JD=`get_astro_JD $NOW_DATE`
      [[ "${layout_a[8]}" -gt "${NOW_JD}" ]] && continue
      [[ "${layout_a[9]}" -lt "${NOW_JD}" ]] && continue


      playable_layouts=$((${playable_layouts}+1))
      
      [[ -z "${l_kill_file}" ]] && touch "${l_kill_file}"
      l_kill_file=${CONTROL_DIR}/${LAYOUT_ID}.layout.kill

      ${WORK_DIR}/layout.player.sh ${LAYOUT_ID} ${LENGTH} &
      sleep ${layout_a[1]}

      [[ -f "${c_kill_file}" ]] && break 2
      
   done < ${COLLECTION_FILE}
done 

IFS=$OIFS

if [ -f "${c_kill_file}" ]; then
do
   rm "${c_kill_file}"
   date +"%c Exit collection player due to kill file: '${c_kill_file}'"
else
   date +"%c Exit collection player without kill file: '${c_kill_file}'"
done
exit 0
