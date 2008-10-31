#!/bin/bash
#
# Finds dimension Id from database. Creates new dimension if needed.

. sw-script-header.sh

if [ $# != 2 ]
then
	echo "Usage: ${0} <width> <height>"
	exit 1
fi


_table="dimension"

dimension_Id=`mysql -u ${_DB_USER} --password="${_DB_PASSWORD}" --host=${_DB_HOST} -D ${_DB_SCHEMA} -s <<EOFMYSQL
select Id from ${_DB_PREFIX}${_table}s where dimension_x=${1} and dimension_y=${2};
EOFMYSQL`

if [ "" = "${dimension_Id}" ]
then
mysql -u ${_DB_USER} --password="${_DB_PASSWORD}" --host=${_DB_HOST} -D ${_DB_SCHEMA} -s --default-character-set=utf8<<EOFMYSQL
insert into ${_DB_PREFIX}${_table}s set dimension_x=${1}, dimension_y=${2};
EOFMYSQL
dimension_Id=`mysql -u ${_DB_USER} --password="${_DB_PASSWORD}" --host=${_DB_HOST} -D ${_DB_SCHEMA} -s <<EOFMYSQL
select Id from ${_DB_PREFIX}${_table}s where dimension_x=${1} and dimension_y=${2};
EOFMYSQL`
fi

echo ${dimension_Id}

exit 0
