#!/bin/sh

DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )"/.. && pwd )
cd ${DIR}

rm -rf ${DIR}/bin
# Make osx32
mkdir -p ${DIR}/bin/osx32

cp -r ${DIR}/code ${DIR}/bin/osx32
cp -r ${DIR}/imgs ${DIR}/bin/osx32
cp -r ${DIR}/node_modules ${DIR}/bin/osx32
cp -r ${DIR}/index.html ${DIR}/bin/osx32
cp -r ${DIR}/package.json ${DIR}/bin/osx32
cp -r ${DIR}/LICENSE.md ${DIR}/bin/osx32

pushd ${DIR}/bin/osx32
zip -r ../app.nw ./*
rm -r *
popd

cp -r ${DIR}/../nwbuilder/cache/0.8.6/osx32/node-webkit.app ${DIR}/bin/osx32/
cp "${DIR}/ffmpegsumo for 0.8.6/ffmpegsumo.so" "${DIR}/bin/osx32/node-webkit.app/Contents/Frameworks/node-webkit Framework.framework/Libraries/"
mv ${DIR}/bin/app.nw "${DIR}/bin/osx32/node-webkit.app/Contents/resources/"
cp ${DIR}/imgs/sw.icns "${DIR}/bin/osx32/node-webkit.app/Contents/resources/nw.icns"

patch ${DIR}/bin/osx32/node-webkit.app/Contents/Info.plist make/info_plist.patch

# ln -s /Applications ${DIR}/bin/osx32

applicationName="Screenwerk.app"
mv ${DIR}/bin/osx32/node-webkit.app "${DIR}/bin/osx32/${applicationName}"

# Create a R/W DMG
DMGName=${DIR}/bin/temp.dmg
finalDMGName=${DIR}/bin/Screenwerk.dmg
sizeOfDmg=200M
diskTitle="Screenwerk 2014"
hdiutil create -srcfolder "${DIR}/bin/osx32" -volname "${diskTitle}" \
        -fs HFS+ -fsargs "-c c=64,a=16,e=16" -format UDRW -size ${sizeOfDmg} "${DMGName}"

# Mount the image
device=$(hdiutil attach -readwrite -noverify -noautoopen "${DMGName}" | \
         egrep '^/dev/' | sed 1q | awk '{print $1}')

# Give some time for finder to mount
# sleep 5

# prepare for ascript
backgroundPictureName="dmgback.png"
pushd "/Volumes/${diskTitle}"
mkdir -p .background
cp ${DIR}/imgs/${backgroundPictureName} .background
popd

echo "Run ascript"

echo '
   tell application "Finder"
     tell disk "Screenwerk 2014"
           open
           set current view of container window to icon view
           set toolbar visible of container window to false
           set statusbar visible of container window to false
           set the bounds of container window to {400, 100, 885, 430}
           set theViewOptions to the icon view options of container window
           set arrangement of theViewOptions to not arranged
           set icon size of theViewOptions to 72
           set background picture of theViewOptions to file ".background:'${backgroundPictureName}'"
           make new alias file at container window to POSIX file "/Applications" with properties {name:"Applications"}
           set position of item "'${applicationName}'" of container window to {100, 100}
           set position of item "Applications" of container window to {375, 100}
           update without registering applications
           delay 5
           close
     end tell
   end tell
' | osascript

echo "Try chmod -Rf go-w /Volumes/${diskTitle}"
chmod -Rf go-w /Volumes/"${diskTitle}"
sync
sync
# echo "sleep 5"
# sleep 5
echo "Try hdiutil detach ${device}"
hdiutil detach ${device}

echo "Try hdiutil convert ${DMGName} -format UDZO -imagekey zlib-level=9 -o ${finalDMGName}"
hdiutil convert "${DMGName}" -format UDZO -imagekey zlib-level=9 -o "${finalDMGName}"
rm -f "${DMGName}"





