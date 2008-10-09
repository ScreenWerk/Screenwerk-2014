#!/bin/bash -
mysqldump -u screenwerk --add-drop-database --all --databases screenwerk > $SW_HOME/bin/dev/mysqldump.sql
mysqldump -u screenwerk --no-create-info screenwerk sw_aspects > $SW_HOME/bin/dev/aspects.sql
exit 0
