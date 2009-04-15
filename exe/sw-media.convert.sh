#!/bin/bash
#
# Attempts to rescale source media file named A_B_CxD
# On success renames media file to A_B_CxD.MEDIATYPE, where
# A - screen id
# B - media id
# CxD - media dimensions
# MEDIATYPE is one of VIDEO, IMAGE, URL or HTML.
# If named media file already exists, just remove source file

. sw-script-header.sh

if [ $# != 2 ]
then
	echo "Usage: ${0} <media file name> <customer ID>"
	exit 1
fi

original_media="${_DIR_ORIGINAL_MEDIA}/${2}/${1}"
if [ ! -r "${original_media}" ]
then
	echo "${original_media} is not readable."
	exit 1
fi


media_id=`${_DIR_EXE}/sw-media.find_by_filename_and_customer.sh "${1}" ${2}`
media_type=`${_DIR_EXE}/mediatype.sh "${original_media}"|cut -d" " -f1`

case ${media_type} in
   VIDEO)
      master_media=${_DIR_MASTERS}/${media_id}.${media_type}
      ffmpeg -i "${original_media}" -an -vcodec flv -sameq -y "${master_media}.flv" #2&>1 1>/dev/null
      mv "${master_media}.flv" "${master_media}"
      ;;
   IMAGE)
      master_media=${_DIR_MASTERS}/${media_id}.${media_type}
      cp ${original_media} ${master_media}
      ;;
   HTML)   
      master_media=${_DIR_MASTERS}/${media_id}.${media_type}
      cp ${original_media} ${master_media}
      ;;
   URL)
      master_media=${_DIR_MASTERS}/${media_id}.${media_type}
      cp ${original_media} ${master_media}
      ;;
   SWF)
      master_media=${_DIR_MASTERS}/${media_id}.${media_type}
      cp ${original_media} ${master_media}
      ;;
   *)       echo "Unsupported media type"
            exit 1;;
esac

date +"%c sw-media.convert.sh \"${original_media}\" to ${master_media} finished"

exit 0
