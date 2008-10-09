#!/bin/bash

. sw-script-header.sh

_table=media
_field=filename


mysql -u ${_DB_USER} --password="${_DB_PASSWORD}" -D ${_DB_SCHEMA} -s --default-character-set=utf8<<EOFMYSQL
select Id from ${_DB_PREFIX}${_table}s where ${_field}='${1}';
EOFMYSQL


# | grep : | sed -e 's/: /="/g; s/^ */media_/g; s/$/"/g'

exit 0
