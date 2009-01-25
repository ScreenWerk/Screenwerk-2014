#!/bin/bash

WORK_DIR=`dirname ${0}`
. ${WORK_DIR}/screen.conf
. ${WORK_DIR}/screenlib.sh


while [ ! -z ${1} ]
do
   echo "B. ${1}"
   shift
done

exit 0
