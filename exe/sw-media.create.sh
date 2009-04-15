#!/bin/bash
#
# Attempts to create new media.
# On success returns created media id.
# If name already in use, returns existing id and exits with error code 1.0

. sw-script-header.sh

case $# in
   1)
      incoming_media=${_DIR_INCOMING_MEDIA}/${1}
      media_owner=`ls -o "${incoming_media}" | cut -d" " -f3`
      customer_id=`${_DIR_EXE}/sw-customer.find_by_username.sh ${media_owner}`
      ;;
   2)
      incoming_media=${_DIR_INCOMING_MEDIA}/${2}/${1}
      customer_id=${2}
      ;;
   *)
      echo "Usage: ${0} <media file name> [customer ID]"
      exit 1
      ;;
esac
date +"%c sw-media.create.sh start \"${incoming_media}\" for customer ${customer_id}"




media_id=`${_DIR_EXE}/sw-media.find_by_filename_and_customer.sh "${1}" ${customer_id}`
if [ -n "${media_id}" ]
then
	date +"%c WARNING: Media \"${1}\" already loaded - id:${media_id}"
#	exit 10
fi


if [ ! -r "${incoming_media}" ]
then
	echo "${incoming_media} is not readable."
	exit 1
fi
media_type=`${_DIR_EXE}/mediatype.sh "${incoming_media}"`

case `echo ${media_type}|cut -d" " -f1` in
   VIDEO)   TMP_FILE="/tmp/${1}.tmp"
            ID_VIDEO_WIDTH=""
            ID_VIDEO_HEIGHT=""
            ID_LENGTH=""
            ${_DIR_EXE}/midentify.sh "${incoming_media}" > "${TMP_FILE}"
            if [ `wc -l "${TMP_FILE}" | cut -d' ' -f1` -eq 0 ]
            then
               echo "${incoming_media} by ${customer_id}: Unsupported media type"
               exit 1
            fi
            . "${TMP_FILE}"
            rm "${TMP_FILE}"
            ID_WIDTH=${ID_VIDEO_WIDTH}
            ID_HEIGHT=${ID_VIDEO_HEIGHT}
            ;;
   IMAGE)   ID_WIDTH=`echo ${media_type}|cut -d" " -f2|cut -d"x" -f1`
            ID_HEIGHT=`echo ${media_type}|cut -d" " -f2|cut -d"x" -f2`
            ID_LENGTH=${_DEFAULT_IMAGE_LENGTH}
            media_type=`echo ${media_type}|cut -d" " -f1`
            ;;
   HTML)    ID_WIDTH="0"
            ID_HEIGHT="0"
            ID_LENGTH=${_DEFAULT_HTML_LENGTH}
            ;;
   URL)     ID_WIDTH="0"
            ID_HEIGHT="0"
            ID_LENGTH=${_DEFAULT_URL_LENGTH}
            ;;
   SWF)     ID_WIDTH="0"
            ID_HEIGHT="0"
            ID_LENGTH=${_DEFAULT_URL_LENGTH}
            ;;
   *)       echo "Unsupported media type"; exit 1;;
esac


DIMENSION_ID=`${_DIR_EXE}/sw-dimension.findcreate.sh ${ID_WIDTH} ${ID_HEIGHT}`
#echo "dimension_Id='${DIMENSION_ID}'"

if [ ! -n "${media_id}" ]
then
   query="INSERT into ${_DB_TABLE_MEDIA}
set filename='${1}', customer_id='${customer_id}', type='${media_type}', dimension_id=${DIMENSION_ID}, location='ORIGINAL', length=${ID_LENGTH};"
   echo $query

mysql -u ${_DB_USER} --password="${_DB_PASSWORD}" -D ${_DB_SCHEMA} --host=${_DB_HOST} -sN --default-character-set=utf8<<EOFMYSQL
INSERT into ${_DB_TABLE_MEDIA}
set filename='${1}', customer_id='${customer_id}', type='${media_type}', dimension_id=${DIMENSION_ID}, location='ORIGINAL', length=${ID_LENGTH};
EOFMYSQL

   media_id=`${_DIR_EXE}/sw-media.find_by_filename_and_customer.sh "${1}" ${customer_id}`
fi

date +"%c sw-media.create.sh finish \"${incoming_media}\" for customer ${customer_id} finished with media id:${media_id}"

[[ -d ${_DIR_ORIGINAL_MEDIA}/${customer_id} ]] || mkdir ${_DIR_ORIGINAL_MEDIA}/${customer_id}
mv "${incoming_media}" ${_DIR_ORIGINAL_MEDIA}/${customer_id}/

exit 0
