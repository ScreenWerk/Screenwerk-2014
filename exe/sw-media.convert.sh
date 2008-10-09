#!/bin/bash
#
# Attempts to rescale source media file named A_B_CxD.4c
# On success renames media file to A_B_CxD.video, where
# A - screen id
# B - media id
# CxD - media dimensions
# If named media file already exists, just remove source .4c file

. sw-script-header.sh

if [ $# != 1 ]
then
	echo "Usage: ${0} <media file path>"
	exit 1
fi

incoming_media="${_DIR_CONVERT}/${1}"
if [ ! -r "${incoming_media}" ]
then
	echo "${incoming_media} is not readable."
	exit 1
fi

media_type=`${_DIR_EXE}/mediatype.sh "${incoming_media}"`

case `echo ${media_type}|cut -d" " -f1` in
   VIDEO)   ffmpeg_out=${_DIR_SCREENS}/${1}

            screen_id=`echo ${1} | cut -d_ -f1`
            media_id=`echo ${1} | cut -d_ -f2`
            width=`echo ${1} | cut -d_ -f3 | cut -d. -f1 | cut -dx -f1`
            height=`echo ${1} | cut -d_ -f3 | cut -d. -f1 | cut -dx -f2`

            master_video_file=${_DIR_SCREENS}/master_${media_id}_${width}x${height}.video
            video_file=${_DIR_SCREENS}/${screen_id}_${media_id}_${width}x${height}.video

            if [ -f ${video_file} ]
            then
               echo "${video_file} already in place"
            else
               if [ -f ${master_video_file} ]
               then
                  echo "ln -s ${master_video_file} ${video_file}"
                  ln ${master_video_file} ${video_file}
               else
                  echo "Converting to ${ffmpeg_out}"
                  echo "ffmpeg -i ${incoming_media} -an -s ${width}x${height} ${ffmpeg_out}"
                  ffmpeg -i ${incoming_media} -an -s ${width}x${height} ${ffmpeg_out}
                  mv ${ffmpeg_out} ${master_video_file}
                  echo "ln -s ${master_video_file} ${video_file}"
                  ln ${master_video_file} ${video_file}
               fi
            fi
            ;;
   IMAGE)   cp ${incoming_media} ${_DIR_SCREENS}
            ;;
   HTML)    cp ${incoming_media} ${_DIR_SCREENS}
            ;;
   URL)     cp ${incoming_media} ${_DIR_SCREENS}
            ;;
   *)       echo "Unsupported media type"
            exit 1;;
esac



#rm ${incoming_media}

exit 0
