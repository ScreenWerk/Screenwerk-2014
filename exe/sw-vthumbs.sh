#!/bin/bash
#

. sw-script-header.sh

${_DIR_EXE}/midentify.sh "${_DIR_MASTERS}/${1}.VIDEO" > /tmp/foo
. /tmp/foo
rm /tmp/foo
framerate=`echo "scale=2; 20/$ID_LENGTH" | bc`

w=250
h=`echo "scale=0; $ID_VIDEO_HEIGHT*$w/$ID_VIDEO_WIDTH/2" | bc`
h=`echo "scale=0; $h*2" | bc`

echo "creating ${w}x${h} thumbs for ${1}"

echo "ffmpeg -i ${_DIR_MASTERS}/${1}.VIDEO -vframes 20 -r ${framerate} -s ${w}x${h} -y ${_DIR_THUMBS}/${1}_%d.png"
ffmpeg -i "${_DIR_MASTERS}/${1}.VIDEO" -vframes 20 -r ${framerate} -s ${w}x${h} -y ${_DIR_THUMBS}/${1}_%d.png
ln -f ${_DIR_THUMBS}/${1}_2.png ${_DIR_THUMBS}/${1}.png
ln -f ${_DIR_THUMBS}/${1}_2.png ${_DIR_THUMBS}/${1}s.png

