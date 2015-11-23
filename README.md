# ScreenWerk 2014 [![Codacy Badge](https://api.codacy.com/project/badge/grade/28b7ebd9bb5246baa5a3a37dec3f5aa5)](https://www.codacy.com/app/mihkel-putrinsh/Screenwerk)

[![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/argoroots/Screenwerk?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)

## Setup

1. **Git** - Download and install git version control system from https://git-scm.com/download

    Git installer for windows is really verbose and asks a lot. Most settings are correct by default, but on one form it asks

    **Adjusting your PATH environment** - How would you like to use Git from the command line?  
    Select "**Use Git from the Windows Command Prompt**" as it enables you to make custom launcher for auto-updating the code before starting the player.

2. ** ScreenWerk** - Open terminal/cmd and navigate to your Documents or Desktop folder, then run
    > \> git clone https://github.com/argoroots/Screenwerk.git

3. **NODE** - Download appropriate LTS version from https://nodejs.org/en/download/ and install on system.

4. Open terminal/cmd, navigate to Screenwerk folder and run commands:
   > \> npm install  
   > \> npm install -g nwjs  

### Running the player
You can launch ScreenWerk by opening terminal/cmd app and executing

    nwjs .

in Screenwerk folder.

If you want to make sure that you are always running latest player, use a launcher script
**launcher.bat** for windows or **launcher.sh** for linux/osx


### Troubleshooting

#### You can try running SW on different version of nw.js

* log the version of nw.js you use to run your app
   > \> nwjs info

* install some version of nw.js
   > \> nwjs use 0.12.3  
   > \> nwjs use 0.13.0-alpha2  
   > \> ...




### References
- **node** - https://nodejs.org/en/download/  
- **nwjs package** - https://www.npmjs.com/package/nwjs  
- **ScreenWerk player** - https://github.com/argoroots/Screenwerk/archive/master.zip  
- **Git** - https://git-scm.com/download  

## Latest installers

- Windows [0.2.0-beta.1](https://github.com/argoroots/Screenwerk/releases/download/0.2.0-beta.1/swsetup.exe)
- Linux 32 bit [0.2.0-beta.2.1](https://github.com/argoroots/Screenwerk/releases/download/0.2.0-beta.2.1/linux32.2.zip)
- Linux 64 bit [0.2.0-beta.2.1](https://github.com/argoroots/Screenwerk/releases/download/0.2.0-beta.2.1/linux64.2.zip)
- Mac [0.2.0-beta.2.1](https://github.com/argoroots/Screenwerk/releases/download/0.2.0-beta.2.1/Screenwerk.dmg)


### Important notes
> SW14 uses node-webkit >= v0.10.5
> Out of the box SW14 supports only webm video type.
> For proprietary codecs (i.e. MP4) a ffmpegsumo library has to be copied from Google Chrome into node-webkit package.
> Suitable fmpegsumo version was provided with chrome version 36.0.1985.125 http://google-chrome.en.uptodown.com/mac/old
> Video medias **must** have filename with correct extension as screenwerk doesnot bother to detect mimetypes.

### Supported attributes

#### All elements

- ***in-pixels***
  All elements occupy 100% of available screen estate by default. If dimensions are specified, then by default it is assumed to be in %. If *in-pixels* attribute is selected, element will be rendered with pixel accuracy.

#### Screengroup

- ***published-at***
  Set the desired publishing time for screens in this group. If player detects change in ***published-at*** property, it starts to fetch new content and restarts its schedules as soon as possible but not earlier than specified by ***published-at***.

#### Schedule

- ***crontab***
  Some valid crontab examples are shown below. Minimal resolution is 1 minute.
  <table>
<thead>
<tr><th>MIN</th> <th>HOUR</th> <th>DOM</th> <th>MON</th> <th>DOW</th> <th>Explanation</th></tr>
</thead>
<tbody>
<tr><td>1</td>      <td>*</td>       <td>*</td>   <td>*</td>   <td>*</td>     <td>Every hour on the first minute</td></tr>
<tr><td>*</td>      <td>*</td>       <td>*</td>   <td>*</td>   <td>*</td>     <td>Every Minute</td></tr>
<tr><td>*/10</td>   <td>*</td>       <td>*</td>   <td>*</td>   <td>*</td>     <td>Every ten minutes</td></tr>
<tr><td>0</td>      <td>09-18</td>   <td>*</td>   <td>*</td>   <td>*</td>     <td>Every hour during work hours (Hour range)</td></tr>
<tr><td>0</td>      <td>09-18/3</td> <td>*</td>   <td>*</td>   <td>*</td>     <td>09-18/3 equals 09,12,15,18</td></tr>
<tr><td>0</td>      <td>09-18</td>   <td>*</td>   <td>*</td>   <td>1-5</td>   <td>Every hour during work hours (Hour range) on working days</td></tr>
<tr><td>0</td>      <td>01,13</td>   <td>*</td>   <td>*</td>   <td>6,0</td>   <td>1AM and 1PM (Multi Value) every Saturday and Sunday</td></tr>
</tbody>
</table>

- ***ordinal***
  Affects cleanup action

- ***cleanup***
  If set to true, **Schedule** will stop all currently playing **Layouts** with *ordinal* less than or equal to itself's *ordinal*


#### Layout-Playlist

- ***loop***
  If set to true, loop property will propagate to **Playlist**. If not set or set to false, it will not propagate at all

- ***layer***
  If not set, element will be placed on layer 1 (*z-index* = 1). Layers with higher number will be rendered on top of layers with smaller number. If multiple elements share same *layer*, then its up to chance, which one will be on top of another.

#### Playlist

> By default **Playlists** will not loop. If any parent **Layout-Playlist** has *loop* = true, **Playlist** will loop.
> May cause confusion (as unexpected looping), if same **Playlist** is used on multiple **Layouts** (on same **Screen**) but should loop on only some.

#### Playlist-Media

> #### ToDo:
>     **Playlist-Media** could be configured as a hierarchical object
>     where every child **Playlist-Media** will be rendered right after parent.

- ***mute***
  If set to true, *mute* property will propagate to **Media**. If not set or set to false, it will not propagate at all.
- ***duration***
  If not set, then media will play till its own "end" event happens. For images and urls there is no native "end" event and duration is required, if media has to stop after some time. Duration is set in seconds.
- ***delay***
  If not set, then media will start immediately. If set, then media will wait for that long before starting. Delay is set in seconds.
  ***ordinal***
  Medias are ordered in playlist by ordinal. In case two ordinals are equal, then their order is up to chance.




#### Media
> ***mute***: By default everything plays with sound. **Media** gets muted by parent **Playlist-Media**.
