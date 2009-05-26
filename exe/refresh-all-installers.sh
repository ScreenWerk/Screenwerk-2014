#!/bin/bash
#

wget http://www.screenwerk.eu/player/get_player_md5_list

rm -R /swtrunk/ftp/players/SWPlayer

unzip /swtrunk/ftp/players/SWPlayer_${1}.airi -d /swtrunk/ftp/players/SWPlayer


cat get_player_md5_list | \
while read md5
do
	/swtrunk/exe/sign-player-installer.sh $md5 
done

rm get_player_md5_list
