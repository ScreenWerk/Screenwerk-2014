#!/bin/bash -
mplayer -vo null -ao null -frames 0 -identify "$@" 2>/dev/null |
	sed -ne '/^ID_/ {
			  s/[]()|&;<>`'"'"'\\!$" []/\\&/g;p
			}'

exit $?
