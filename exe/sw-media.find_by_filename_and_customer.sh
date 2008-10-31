#!/bin/bash

. `dirname ${0}`/sw-script-header.sh

query="select id from ${_DB_PREFIX}medias where customer_id='${2}' and filename='${1}'"
mysql -u ${_DB_USER} --password="${_DB_PASSWORD}" -D ${_DB_SCHEMA} --host=${_DB_HOST} -s --default-character-set=utf8<<EOFMYSQL
${query};
EOFMYSQL

exit 0
