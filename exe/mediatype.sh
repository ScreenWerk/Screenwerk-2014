#!/bin/bash -
# wirtten by mihkel putrinsh <mihkel@ww.ee>
#
#
ver="0.1"
help()
{
    echo "Usage -- ${0} filename"
    echo "File should be one of following:"
    echo " - Video file - all formats are supported;"
    echo " - Image file - all formats except animated gif's are supported;"
    echo " - SWF - animated gifs should be converted to swf;"  
    echo " - PDF;"
    echo " - URL - ascii file named like \"linkname.url\" with single address line as contents;"  
    echo " - HTML - HTML have to be compressed in single archive. zip archives are supported."
    echo "Outputs media type - VIDEO/IMAGE/HTML/URL."
    exit 0
}
error()
{
    echo "$1"
    exit "$2"
}
while [ -n "$1" ]; do
case $1 in
    -h) help;shift 1;;
    -*) error "error: no such option $1. -h for help" 1;;
    *)  break;;
esac
done

if [ -z "$1" ];then
    error "No media file specified, -h for help" 1
fi

if [ ! -r "$1" ];then
    error "Media file not readable, -h for help" 1
fi

# Test by file extension, if it could be html package or plain url
extension=${1/*./}
case $extension in
   pdf) echo "PDF"; exit 0;;
   swf) echo "SWF"; exit 0;;
   url) echo "URL"; exit 0;;
   zip) echo "HTML"; exit 0;;
   html) echo "HTML"; exit 0;;
esac

# Test, if file could be a picture and output dimensions as well
I=`identify ${1} 2>/dev/null`
# If it was anything else but image, error code >0 is returned
if [ $? -eq 0 ]
then
   echo -n "IMAGE "
   echo $I | cut -d" " -f3
   exit 0
fi

# Assume, that media type is video
echo "VIDEO"

# Further processing of video file is left for calling program

exit 0
 

# process each image
#for imgfile in $* ;do
#   if [ ! -r "$imgfile" ]; then
#      echo "ERROR: can not read $imgfile"
#      continue
#   fi
#   geometry=`identify $imgfile | awk '{print $3}'`
   # geometry can be 563x144+0+0 or 75x98
   # get rid of the +0+0
#   echo $geometry
#   width=`echo $geometry | sed 's/[^0-9]/ /g' | awk '{print $1}'`
#   height=`echo $geometry | sed 's/[^0-9]/ /g' | awk '{print $2}'`
#   echo "<img src=\"$imgfile\" width=\"$width\" height=\"$height\" alt=\"[]\">"
#done

