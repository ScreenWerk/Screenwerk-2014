#!/bin/bash

. `dirname ${0}`/sw-script-header.sh


mysql -u ${_DB_USER} --password="${_DB_PASSWORD}" -D ${_DB_SCHEMA} --host=${_DB_HOST} -s --default-character-set=utf8<<EOFMYSQL
select customer_id from ${_DB_PREFIX}users where username='${1}';
EOFMYSQL


exit 0
