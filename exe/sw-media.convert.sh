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
echo -n "Detecting media type ... "
media_type=`${_DIR_EXE}/mediatype.sh "${original_media}"|cut -d" " -f1`
echo ${media_type}

case ${media_type} in
   VIDEO)
      master_media=${_DIR_MASTERS}/${media_id}.${media_type}
#      ffmpeg -i "${original_media}" -an -vcodec flv -sameq -y "${master_media}.flv" #2&>1 1>/dev/null
#      ffmpeg -i "${original_media}" -an -vcodec flv -qmin 1 -qmax 3 -y "${master_media}.flv" #2&>1 1>/dev/null
      echo
      echo "ffmpeg -i \"${original_media}\" -ab 192k -vcodec flv -qmin 1 -qmax 3 -y \"${master_media}.flv\" #2&>1 1>/dev/null"
      ffmpeg -i "${original_media}" -ab 192k -vcodec flv -qmin 1 -qmax 3 -y "${master_media}.flv" #2&>1 1>/dev/null
      mv "${master_media}.flv" "${master_media}"

      ${_DIR_EXE}/midentify.sh "${original_media}" > /tmp/foo
      . /tmp/foo
      rm /tmp/foo
      framerate=`echo "scale=2; 20/$ID_LENGTH" | bc`
      w=250
      h=`echo "scale=0; $ID_VIDEO_HEIGHT*$w/$ID_VIDEO_WIDTH/2" | bc`
      h=`echo "scale=0; $h*2" | bc`
      ffmpeg -i "${original_media}" -vframes 20 -r ${framerate} -s ${w}x${h} -y ${_DIR_THUMBS}/${media_id}_%d.jpg
      ln -f ${_DIR_THUMBS}/${media_id}_5.jpg ${_DIR_THUMBS}/${media_id}.jpg
      convert -scale 16x16 ${_DIR_THUMBS}/${media_id}.jpg ${_DIR_THUMBS}/${media_id}s.jpg
      ;;
   IMAGE)
      master_media=${_DIR_MASTERS}/${media_id}.${media_type}
      echo -n "copy ${original_media} to ${master_media} ... "
      cp ${original_media} ${master_media}
      echo "done"

      echo -n "Identifying dimensions (${_DIR_EXE}/midentify.sh \"${original_media}\") ... "
      ${_DIR_EXE}/midentify.sh "${original_media}" > /tmp/foo
      . /tmp/foo
      rm /tmp/foo
      echo "${ID_VIDEO_WIDTH}X${ID_VIDEO_HEIGHT}"

      echo -n "Creating thumbnails ... "
      w=250
      h=`echo "scale=0; $ID_VIDEO_HEIGHT*$w/$ID_VIDEO_WIDTH/2" | bc`
      h=`echo "scale=0; $h*2" | bc`
      convert -scale ${w}x${h} "${original_media}" ${_DIR_THUMBS}/${media_id}.jpg
      convert -scale 16x16 "${original_media}" ${_DIR_THUMBS}/${media_id}s.jpg
      echo "done"
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
   PDF)
      master_media=${_DIR_MASTERS}/${media_id}.${media_type}
      cp ${original_media} ${master_media}
      convert -scale 250x250 "${original_media}" ${_DIR_THUMBS}/${media_id}.jpg
      convert -scale 16x16 "${original_media}" ${_DIR_THUMBS}/${media_id}s.jpg
      ;;
   *)       echo "Unsupported media type"
            exit 1;;
esac

date +"%c sw-media.convert.sh \"${original_media}\" to ${master_media} finished"

exit 0
