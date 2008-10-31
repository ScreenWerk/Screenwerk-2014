#!/bin/bash
#
# Attempts to create new media.
# On success returns created media id.
# If name already in use, returns existing id and exits with error code 1.0

. sw-script-header.sh

if [ $# != 1 ]
then
	echo "Usage: ${0} <media file path>"
	exit 1
fi

incoming_media=${_DIR_INCOMING_MEDIA}/${1}
media_owner=`ls -o ${incoming_media} | cut -d" " -f3`
customer_id=`${_DIR_EXE}/sw-customer.find_by_username.sh ${media_owner}`


media_Id=`${_DIR_EXE}/sw-media.find_by_filename_and_customer.sh "${1}" ${customer_id}`
if [ -n "${media_Id}" ]
then
	echo "Media \"${1}\" already loaded - Id:${media_Id}"
	exit 10
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
            ${_DIR_EXE}/midentify.sh "${_DIR_INCOMING_MEDIA}/${1}" > "${TMP_FILE}"
            . "${TMP_FILE}"
            rm "${TMP_FILE}"
            ID_WIDTH=${ID_VIDEO_WIDTH}
            ID_HEIGHT=${ID_VIDEO_HEIGHT}
            ;;
   IMAGE)   echo "I"
            echo ${media_type}|cut -d" " -f2
            exit;;
   HTML)    ID_WIDTH="0"
            ID_HEIGHT="0"
            ID_LENGTH=${_DEFAULT_URL_LENGTH}
            ;;
   URL)     ID_WIDTH="0"
            ID_HEIGHT="0"
            ID_LENGTH=${_DEFAULT_URL_LENGTH}
            ;;
   *)       echo "Unsupported media type"; exit 1;;
esac



DIMENSION_ID=`${_DIR_EXE}/sw-dimension.findcreate.sh ${ID_WIDTH} ${ID_HEIGHT}`
#echo "dimension_Id='${DIMENSION_ID}'"

echo "INSERT into ${_DB_TABLE_MEDIA} set filename='${1}', type='${media_type}', dimension_id=${DIMENSION_ID}, class='ORIGINAL', length=${ID_LENGTH};"

mysql -u ${_DB_USER} --password="${_DB_PASSWORD}" -D ${_DB_SCHEMA} --host=${_DB_HOST} -sN --default-character-set=utf8<<EOFMYSQL
INSERT into ${_DB_TABLE_MEDIA}
set filename='${1}', customer_id='${customer_id}', type='${media_type}', dimension_id=${DIMENSION_ID}, location='ORIGINAL', length=${ID_LENGTH};
EOFMYSQL

media_Id=`${_DIR_EXE}/sw-media.find_by_filename_and_customer.sh "${1}" ${customer_id}`

echo "Media \"${1}\" loaded - Id:${media_Id}"


mv "${incoming_media}" ${_DIR_ORIGINAL_MEDIA}/${media_Id}

exit 0
