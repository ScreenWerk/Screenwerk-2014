#!/bin/bash

# This function returns the Astro-Julian Date.  The Julian 
# date (JD) is a continuous count of days from 1 January 4713 BC. 
# The following algorithm is good from years 1801 to 2099.
# See URL: 
# http://aa.usno.navy.mil/faq/docs/JD_Formula.html 
# for more information
# arguments: $1 = year in format YYYY, $2 = month, $3 = day
get_astro_JD()
{
typeset -i JDD

JDD=$(($3-32075+1461*($1+4800+($2-14)/12)/4+367*($2-2-($2-14)/12*12)/12-3*(($1+4900+($2-14)/12)/100)/4))
echo $JDD
}


# This function computes the gregorian date from the julian date - $1.  
# Returns a date string in the form: YEAR MONTH DAY
# See URL: 
# http://aa.usno.navy.mil/faq/docs/JD_Formula.html
# for more information
get_greg_from_JD()
{
typeset -i L
typeset -i N
typeset -i I
typeset -i J
typeset -i DAY
typeset -i MON
typeset -i YR

L=$(($1+68569)) # $1 is the julian date
N=$((4*L/146097))
L=$((L-(146097*N+3)/4))
I=$((4000*(L+1)/1461001))
L=$((L-1461*I/4+31))
J=$((80*L/2447))
DAY=$((L-2447*J/80)) 
L=$((J/11))
MON=$((J+2-12*L))
YR=$((100*(N-49)+I+L))

printf '%02i %02i %04i\n' $YR $MON $DAY
}


# pass needle as $1 and array should follow
function in_array()
{
	local i
	needle=$1
	shift 1
	[ -z "$1" ] && return 0	# array() undefined
	for i in $*
	do
		[ "$i" = "$needle" ] && return 1
	done
	return 0
}


# pass needle as $1 and array should follow
function is_le()
{
   [ "$1" -le "${!#}" ] && return 1
	return 0
}


# pass needle as $1 and array should follow
function get_le()
{
	local i
	needle=$1
	shift 1
	for i in $*
	do
		[[ "$needle" -le "$i" ]] && break
	done
	echo $i
}


# pass needle as $1 and array should follow
function is_ge()
{
	[ "$1" -ge "$2" ] && return 1
	return 0
}


# pass needle as $1 and array should follow
function get_ge()
{
	local i
	needle=$1
	shift 1
	for i in $*
	do
		[[ "$needle" -ge "$i" ]] && ret_val=$i
	done
	echo $ret_val
}


function max()
{
   echo ${!#} # return last element of $* array
}
function min()
{
   echo ${1} # return first element of $* array
}


function last_event()
{
   I=0

   while [ "$I" -le "366" ]
   do
      I_JD=$((NOW_JD-I))
      I=$((I+1))
      [[ "$I_JD" -lt "${cronline[8]}" ]] && return 0
      [[ "$I_JD" -lt "${LAST_EVENT[1]}" ]] && return 0

      I_DATE=`get_greg_from_JD $I_JD`
      I_DAY=`echo $I_DATE | cut -d' ' -f3`
      I_MONTH=`echo $I_DATE | cut -d' ' -f2`
      I_WEEKDAY=$((I_JD-I_JD/7*7+1));

      if [ ! "${cronline[3]}" = "*" ]; then
         in_array ${I_DAY} ${cronline[3]}
         [[ $? -eq 0 ]] && continue
      fi
      if [ ! "${cronline[4]}" = "*" ]; then
         in_array ${I_MONTH} ${cronline[4]}
         [[ $? -eq 0 ]] && continue
      fi
      if [ ! "${cronline[5]}" = "*" ]; then
         in_array ${I_WEEKDAY} ${cronline[5]}
         [[ $? -eq 0 ]] && continue
      fi

      #echo "= Candidate last JDay: ${I_JD}"
      #  At this point we have found a candidate day for latest event
      if [ "${I_JD}" -eq "${NOW_JD}" ]; then
         if [ "${cronline[2]}" = "*" ]; then
            EVENT_H=${NOW_TIME_H}
         else
            #echo "=is_ge ${NOW_TIME_H} ${cronline[2]}="
            is_ge ${NOW_TIME_H} ${cronline[2]}
            [[ $? -eq 0 ]] && continue
            EVENT_H=`get_ge ${NOW_TIME_H} ${cronline[2]}`
         fi
      else
         if [ "${cronline[2]}" = "*" ]; then
            EVENT_H=23
         else
            EVENT_H=`max ${cronline[2]}`
         fi
      fi


      if [ "${I_JD}" -eq "${NOW_JD}" -a "${EVENT_H}" -eq "${NOW_TIME_H}" ]; then
         if [ "${cronline[1]}" = "*" ]; then
            EVENT_M=${NOW_TIME_M}
         else
            #echo "= is_ge ${NOW_TIME_M} ${cronline[1]}="
            is_ge ${NOW_TIME_M} ${cronline[1]}
            if [ $? -eq 0 ]; then
               #echo "= NO ="
               [[ "${NOW_TIME_H}" -eq "0" ]] && continue
               if [ "${cronline[2]}" = "*" ]; then
                  EVENT_H=$((NOW_TIME_H-1))
               else
                  #echo "=is_ge $((NOW_TIME_H-1)) ${cronline[2]}="
                  is_ge $((NOW_TIME_H-1)) ${cronline[2]}
                  [[ $? -eq 0 ]] && continue
                  EVENT_H=`get_ge $((NOW_TIME_H-1)) ${cronline[2]}`
               fi
               EVENT_M=`max ${cronline[1]}`
            else
               EVENT_M=`get_ge ${NOW_TIME_M} ${cronline[1]}`
               #echo "= YES : ${EVENT_M}="
            fi
         fi
      else
         if [ "${cronline[1]}" = "*" ]; then
            EVENT_M=59
         else
            EVENT_M=`max ${cronline[1]}`
         fi
      fi

      if [ "${I_JD}" -lt "${LAST_EVENT[1]}" ]; then
         break
      elif [ "${I_JD}" -eq "${LAST_EVENT[1]}" ]; then
         if [ "${EVENT_H}" -lt "${LAST_EVENT[2]}" ]; then
            break
         elif [ "${EVENT_H}" -eq "${LAST_EVENT[2]}" ]; then
            if [ "${EVENT_M}" -lt "${LAST_EVENT[3]}" ]; then
               break
            fi
         fi
      fi
      LAST_EVENT=( ${cronline[0]} ${I_JD} ${EVENT_H} ${EVENT_M} )
      break
      
   done
}

function next_event()
{
   J=${I}
   I=0


   while [ "$J" -le "366" ]
   do
      I_JD=$((NOW_JD+I))
      I=$((I+1))
      J=$((J+1))
      [[ "$I_JD" -gt "${cronline[9]}" ]] && return 0
      [[ "$I_JD" -gt "${NEXT_EVENT[1]}" ]] && return 0

      I_DATE=`get_greg_from_JD $I_JD`
      I_DAY=`echo $I_DATE | cut -d' ' -f3`
      I_MONTH=`echo $I_DATE | cut -d' ' -f2`
      I_WEEKDAY=$((I_JD-I_JD/7*7+1));

      if [ ! "${cronline[3]}" = "*" ]; then
         in_array ${I_DAY} ${cronline[3]}
         [[ $? -eq 0 ]] && continue
      fi
      if [ ! "${cronline[4]}" = "*" ]; then
         in_array ${I_MONTH} ${cronline[4]}
         [[ $? -eq 0 ]] && continue
      fi
      if [ ! "${cronline[5]}" = "*" ]; then
         in_array ${I_WEEKDAY} ${cronline[5]}
         [[ $? -eq 0 ]] && continue
      fi

      #echo "= Candidate next JDay: ${I_JD}"
      #  At this point we have found a candidate day for next event
      if [ "${I_JD}" -eq "${NOW_JD}" ]; then
         if [ "${cronline[2]}" = "*" ]; then
            EVENT_H=${NOW_TIME_H}
         else
            #echo "=is_le ${NOW_TIME_H} ${cronline[2]}="
            is_le ${NOW_TIME_H} ${cronline[2]}
            [[ $? -eq 0 ]] && continue
            EVENT_H=`get_le ${NOW_TIME_H} ${cronline[2]}`
         fi
      else
         if [ "${cronline[2]}" = "*" ]; then
            EVENT_H=0
         else
            EVENT_H=`min ${cronline[2]}`
         fi
      fi


      if [ "${I_JD}" -eq "${NOW_JD}" -a "${EVENT_H}" -eq "${NOW_TIME_H}" ]; then
         if [ "${cronline[1]}" = "*" ]; then
            EVENT_M=${NOW_TIME_M}
         else
            #echo "=is_le $((NOW_TIME_M+1)) ${cronline[1]}="
            is_le $((NOW_TIME_M+1)) ${cronline[1]}
            if [ $? -eq 0 ]; then
               [[ "${NOW_TIME_H}" -eq "23" ]] && continue
               if [ "${cronline[2]}" = "*" ]; then
                  EVENT_H=$((NOW_TIME_H+1))
               else
                  is_le $((NOW_TIME_H+1)) ${cronline[2]}
                  [[ $? -eq 0 ]] && continue
                  EVENT_H=`get_le $((NOW_TIME_H+1)) ${cronline[2]}`
               fi
               EVENT_M=`min ${cronline[1]}`
            else
               EVENT_M=`get_le $((NOW_TIME_M+1)) ${cronline[1]}`
            fi
         fi
      else
         if [ "${cronline[1]}" = "*" ]; then
            EVENT_M=0
         else
            EVENT_M=`min ${cronline[1]}`
         fi
      fi
      
      if [ "${I_JD}" -gt "${NEXT_EVENT[1]}" ]; then
         break
      elif [ "${I_JD}" -eq "${NEXT_EVENT[1]}" ]; then
         if [ "${EVENT_H}" -gt "${NEXT_EVENT[2]}" ]; then
            break
         elif [ "${EVENT_H}" -eq "${NEXT_EVENT[2]}" ]; then
            if [ "${EVENT_M}" -gt "${NEXT_EVENT[3]}" ]; then
               break
            fi
         fi
      fi
      NEXT_EVENT=( ${cronline[0]} ${I_JD} ${EVENT_H} ${EVENT_M} )

      break
      
   done
}

# ZERO_JD=2454850 # Sunday, January 18, 2009
SCHEDULE_FILE=$1
NOW_DATE=`date +'%-Y %-m %-d'`  # 2009 1 18
NOW_DATE_M=$((`date +'%-m'`))  # 1
NOW_DATE_D=`date +'%-d'`  # 18
NOW_DATE_W=`date +'%-u'`  # 1
NOW_TIME=`date +'%-H %-M %-S'`  # 23 11 7
NOW_TIME_H=$((`date +'%-H'`))  # 23
NOW_TIME_M=$((`date +'%-M'`))  # 11
NOW_TIME_S=$((`date +'%-S'`))  # 7
NOW_JD=`get_astro_JD $NOW_DATE`
NOW_WD=$((NOW_JD-NOW_JD/7*7+1)) # 1 - MON, 2 - TUE, ..., 7 - SUN

LAST_EVENT=( 0 0 0 0 )
NEXT_EVENT=( 0 3999999 23 59 )
   export LAST_EVENT
   export NEXT_EVENT


set -f  # disable globbing. wildcards would be expanded otherwise
OIFS=$IFS; IFS=';'

firstline=1

while read l
do
   if [ $firstline -eq 1 ]
   then
      firstline=0
      continue
   fi
   echo $l

   cronline=( $l ) # split $l by semicolon
   
   cronline[1]=`echo ${cronline[1]} | tr ',' ' '`
   cronline[2]=`echo ${cronline[2]} | tr ',' ' '`
   cronline[3]=`echo ${cronline[3]} | tr ',' ' '`
   cronline[4]=`echo ${cronline[4]} | tr ',' ' '`
   cronline[5]=`echo ${cronline[5]} | tr ',' ' '`
   SIFS=$IFS; IFS='-'
      cronline[8]=`get_astro_JD ${cronline[6]}`
      cronline[9]=`get_astro_JD ${cronline[7]}`
   IFS=$SIFS; 

   PIFS=$IFS; IFS=" ,"
      last_event
      next_event
   IFS=$PIFS
   
  # echo '0 id           :'${cronline[0]}  # id
  # echo '1 minutes      :'${cronline[1]}  # minutes
  # echo '2 hours        :'${cronline[2]}  # hours
  # echo '3 days         :'${cronline[3]}  # days
  # echo '4 months       :'${cronline[4]}  # months
  # echo '5 weekdays     :'${cronline[5]}  # weekdays
  # echo '6 valid from   :'${cronline[6]}  # valid from
  # echo '7 valid to     :'${cronline[7]}  # valid to  
  # echo '8 JD valid from:'${cronline[8]}  # JD valid from
  # echo '9 JD valid to  :'${cronline[9]}  # JD valid to  

done < ${SCHEDULE_FILE}

IFS=$OIFS
echo "=> last: '${LAST_EVENT[*]}', next: '${NEXT_EVENT[*]}'"

