#!/bin/sh
# Make win32

DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )"/.. && pwd )
cd ${DIR}
diskTitle="Screenwerk 2014"
workingDir="${DIR}/bin/${diskTitle}"
applicationName="Screenwerk.app"
DMGName="${DIR}/bin/temp.dmg"
finalDMGName="${DIR}/bin/Screenwerk.dmg"
sizeOfDmg="200M"
nwAppPath="${workingDir}/${applicationName}"
backgroundPictureName="dmgback.png"

rm -rf "${workingDir}"
mkdir -p "${workingDir}"

cp -r "${DIR}/code" "${workingDir}"
cp -r "${DIR}/imgs" "${workingDir}"
cp -r "${DIR}/node_modules" "${workingDir}"
cp -r "${DIR}/index.html" "${workingDir}"
cp -r "${DIR}/package.json" "${workingDir}"
cp -r "${DIR}/LICENSE.md" "${workingDir}"

pushd "${workingDir}"
  echo "zip -r ../app.nw ./*"
  zip -r ../app.nw ./*
  rm -r *
popd

cp "${DIR}/../nwbuilder/cache/0.8.6/win32/icudt.dll" "${workingDir}"
cp "${DIR}/../nwbuilder/cache/0.8.6/win32/libEGL.dll" "${workingDir}"
cp "${DIR}/../nwbuilder/cache/0.8.6/win32/libGLESv2.dll" "${workingDir}"
cp "${DIR}/../nwbuilder/cache/0.8.6/win32/nw.exe" "${workingDir}"
cp "${DIR}/../nwbuilder/cache/0.8.6/win32/nw.pak" "${workingDir}"
cp "${DIR}/ffmpegsumo for 0.8.6/ffmpegsumo.dll" "${workingDir}"

echo "cat \"${workingDir}/nw.exe\" \"${DIR}/bin/app.nw\" > \"${workingDir}/screenwerk.exe\""
cat "${workingDir}/nw.exe" "${DIR}/bin/app.nw" > "${workingDir}/screenwerk.exe"
rm -f "${workingDir}/nw.exe" "${DIR}/bin/app.nw"


pushd "${DIR}/bin"
  zip -r "screenwerk_win32".zip "${diskTitle}"/*
popd

cat "${DIR}/make/unzipsfx.exe" "${DIR}/bin/screenwerk_win32.zip" > "${DIR}/bin/swsetup.exe"
zip -A "${DIR}/bin/swsetup.exe"

# rm -rf "${workingDir}" "${DIR}/bin/screenwerk_win32.zip"




