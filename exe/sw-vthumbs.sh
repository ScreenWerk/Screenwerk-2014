#!/bin/bash
#

. sw-script-header.sh

${_DIR_EXE}/midentify.sh "${_DIR_MASTERS}/${1}.VIDEO" > /tmp/foo
. /tmp/foo
rm /tmp/foo
framerate=`echo "scale=2; 20/$ID_LENGTH" | bc`
ffmpeg -i "${_DIR_MASTERS}/${1}.VIDEO" -vframes 20 -r ${framerate} -s sqcif -y ${_DIR_THUMBS}/${1}_%d.png

