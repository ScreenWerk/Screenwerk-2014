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

JDD=$((10#$3-32075+1461*(10#$1+4800+(10#$2-14)/12)/4+367*(10#$2-2-(10#$2-14)/12*12)/12-3*((10#$1+4900+(10#$2-14)/12)/100)/4))
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

echo $YR $MON $DAY
#printf '%04i %02i %02i\n' $YR $MON $DAY
}


# pass needle as $1 and array should follow
function in_array()
{
   #echo -n "$* : "
	local i
	needle=$1
	shift 1
	[ -z "$1" ] && return 0	# array() undefined
	for i in $*
	do
	   #echo "$i =? $needle"
		[ "$i" = "$needle" ] && return 1
		#echo "no"
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
   LAST_EVENT=( "ID" 0 0 0 )
   NOW_DATE=`date +'%-Y %-m %-d'`  # 2009 1 18
   NOW_JD=`get_astro_JD $NOW_DATE`
   NOW_TIME_H=$((`date +'%-H'`))  # 23
   NOW_TIME_M=$((`date +'%-M'`))  # 11


   firstline=1

   while read l
   do
      if [ $firstline -eq 1 ]; then
         firstline=0
         continue
      fi
      
      cronline=( $l ) # split $l by semicolon

      SIFS=$IFS; IFS='-'
         cronline[8]=`get_astro_JD ${cronline[6]}`
         cronline[9]=`get_astro_JD ${cronline[7]}`
      IFS=$SIFS; 

      PIFS=$IFS; IFS=' ,'

         I=0
         while [ "$I" -le "366" ]
         do
            I_JD=$((NOW_JD-I))
            I=$((I+1))
            [[ "$I_JD" -lt "${cronline[8]}" ]] && break 1
            [[ "$I_JD" -lt "${LAST_EVENT[1]}" ]] && break 1

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
                  is_ge ${NOW_TIME_M} ${cronline[1]}
                  if [ $? -eq 0 ]; then
                     [[ "${NOW_TIME_H}" -eq "0" ]] && continue
                     if [ "${cronline[2]}" = "*" ]; then
                        EVENT_H=$((NOW_TIME_H-1))
                     else
                        is_ge $((NOW_TIME_H-1)) ${cronline[2]}
                        [[ $? -eq 0 ]] && continue
                        EVENT_H=`get_ge $((NOW_TIME_H-1)) ${cronline[2]}`
                     fi
                     EVENT_M=`max ${cronline[1]}`
                  else
                     EVENT_M=`get_ge ${NOW_TIME_M} ${cronline[1]}`
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
               break 1
            elif [ "${I_JD}" -eq "${LAST_EVENT[1]}" ]; then
               if [ "${EVENT_H}" -lt "${LAST_EVENT[2]}" ]; then
                  break 1
               elif [ "${EVENT_H}" -eq "${LAST_EVENT[2]}" ]; then
                  if [ "${EVENT_M}" -lt "${LAST_EVENT[3]}" ]; then
                     break 1
                  fi
               fi
            fi
            LAST_EVENT=( ${cronline[0]} ${I_JD} ${EVENT_H} ${EVENT_M} )

            break 1
         done

      IFS=$PIFS
      
   done
   
}

function next_event()
{
   NEXT_EVENT=( "ID" 3999999 23 59 )
   NOW_DATE=`date +'%-Y %-m %-d'`  # 2009 1 18
   NOW_JD=`get_astro_JD $NOW_DATE`
   NOW_TIME_H=$((`date +'%-H'`))  # 23
   NOW_TIME_M=$((`date +'%-M'`))  # 11

   NOW_TIME_M=$((NOW_TIME_M+1))
   if [ "${NOW_TIME_M}" -eq "60" ]; then
      NOW_TIME_M=0
      NOW_TIME_H=$((NOW_TIME_H+1))
      if [ "${NOW_TIME_H}" -eq "24" ]; then
         NOW_TIME_H=0
         NOW_JD=$((NOW_JD+1))
      fi
   fi


   firstline=1

   while read l
   do
      if [ $firstline -eq 1 ]
      then
         firstline=0
         continue
      fi

      cronline=( $l ) # split $l by semicolon

      [[ "${cronline[0]}" -eq "${CURRENT_COLLECTION_ID}" ]] && continue
 
      SIFS=$IFS; IFS='-'
         cronline[8]=`get_astro_JD ${cronline[6]}`
         cronline[9]=`get_astro_JD ${cronline[7]}`
      IFS=$SIFS; 

      PIFS=$IFS; IFS=' ,'

         I=0
         while [ "$I" -le "366" ]
         do
            I_JD=$((NOW_JD+I))
            I=$((I+1))
            [[ "$I_JD" -gt "${cronline[9]}" ]] && break 1
            [[ "$I_JD" -gt "${NEXT_EVENT[1]}" ]] && break 1

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
                  is_le ${NOW_TIME_M} ${cronline[1]}
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
                     EVENT_M=`get_le ${NOW_TIME_M} ${cronline[1]}`
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
               break 1
            elif [ "${I_JD}" -eq "${NEXT_EVENT[1]}" ]; then
               if [ "${EVENT_H}" -gt "${NEXT_EVENT[2]}" ]; then
                  break 1
               elif [ "${EVENT_H}" -eq "${NEXT_EVENT[2]}" ]; then
                  if [ "${EVENT_M}" -gt "${NEXT_EVENT[3]}" ]; then
                     break 1
                  fi
               fi
            fi
            NEXT_EVENT=( ${cronline[0]} ${I_JD} ${EVENT_H} ${EVENT_M} )

            break 1
         done

      IFS=$PIFS
      
   done
}



# ZERO_JD=2454833 # Thursday, January 1, 2009

