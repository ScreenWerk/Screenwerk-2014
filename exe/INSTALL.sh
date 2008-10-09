#!/bin/bash -
# sources available at 
# svn+ssh://michelek@moos.ww.ee/var/svn-repos/project_screenwerk/trunk

if [ ${SW_HOME} ] ; then
  echo "Maybe installed already?"
  exit 0
fi

export SW_HOME="/home/mihkel/Desktop/screenwerk"
export SCREENWERK_HOME=${SW_HOME}



# dont forget to install SCREENWERK_HOME defined in .profile
cat >> ~/.profile << EOE
SCREENWERK_HOME=${SCREENWERK_HOME}
export SCREENWERK_HOME
export SW_HOME=\${SCREENWERK_HOME}

# set PATH so it includes SREENWERK's private bin if it exists
if [ -d \${SW_HOME}/bin ] ; then
    PATH=\${SW_HOME}/bin:"\${PATH}"
fi
if [ -d \${SW_HOME}/bin/dev ] ; then
    PATH=\${SW_HOME}/bin/dev:"\${PATH}"
fi
EOE


# add some required components
sudo aptitude install apache2 php5-mysql libapache2-mod-php5 mysql-server inotify-tools mplayer mencoder

# link to apache webroot
sudo ln -s ${SW_HOME}/bin/www /var/www/screenwerk

sudo apache2 -k restart


# add rights for web user
sudo adduser `whoami` www-data
sudo chown www-data:www-data ${SW_HOME}/bin/www/screens -R
sudo chmod 770 ${SW_HOME}/bin/www/screens -R


# create schema and add some initial data
mysql -u root -p < $SW_HOME/bin/dev/mysqldump.sql
mysql -u root -p < $SW_HOME/bin/dev/aspects.sql

exit 0
