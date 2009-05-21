#!/bin/bash
#

. sw-script-header.sh

SCREEN_MD5=${1}

PLAYERS_DIR=/swtrunk/ftp/players
SOURCE_DIR=${PLAYERS_DIR}/SWPlayer
SRC_APP_XML=${SOURCE_DIR}/META-INF/AIR/application.xml
TARGET_AIR=${PLAYERS_DIR}/for_screens/${SCREEN_MD5}

TMP_SCREEN_MD5_DIR=/tmp/${SCREEN_MD5}
TMP_SCREEN_MD5_FILE=${TMP_SCREEN_MD5_DIR}/screen.md5

KEYSTORE=/swtrunk/exe/screenwerk.eu.p12



mkdir -p ${TMP_SCREEN_MD5_DIR}
echo ${SCREEN_MD5} > ${TMP_SCREEN_MD5_FILE}


expect -c "spawn /opt/air_1.5_sdk/bin/adt -package -storetype pkcs12 -keystore ${KEYSTORE} ${TARGET_AIR} ${SRC_APP_XML} -C ${SOURCE_DIR} SWPlayer.swf icons -C ${TMP_SCREEN_MD5_DIR} screen.md5" -c 'expect password:' -c 'send kamarajura\r' -c 'expect eof'

mv ${TARGET_AIR}.air ${TARGET_AIR}

rm ${TMP_SCREEN_MD5_DIR} -R
