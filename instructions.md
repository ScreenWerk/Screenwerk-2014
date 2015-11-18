### Setup

1. https://nodejs.org/en/download/
   - Download appropriate LTS version and install on system.
2. https://github.com/argoroots/Screenwerk/archive/master.zip
   - Download latest code and unpack in folder of choice.
3. Open terminal/cmd, navigate to Screenwerk folder and run commands:
   > \> npm install
   > \> npm install -g nwjs
   > \> nwjs .

### Troubleshooting

#### You can try running SW on different version of nw.js

* log the version of nw.js you use to run your app
   > \> nwjs info

* install some version of nw.js
   > \> nwjs use 0.12.3
   > \> nwjs use 0.13.0-alpha2
   > \> ...

#### Install git to enable updating SW player's code
1. Download and install git version control system from https://git-scm.com/download

    Git installer for windows is really verbose and asks a lot. Most settings are correct by default, but on one form it asks

    **Adjusting your PATH environment** - How would you like to use Git from the command line?

    Select "**Use Git from the Windows Command Prompt**" as it enables you to make custom launcher for auto-updating the code before starting the player.

2. Now open terminal/cmd, navigate to player's code directory and run
    > \> git pull

That way you could set up your launcher to run two commands in sequence thus making sure You are running latest version of player.

##### launcher.bat (or launcher.sh for linux/osx)
    git pull
    nwjs .

### References
node - https://nodejs.org/en/download/
nwjs package - https://www.npmjs.com/package/nwjs
SW player - https://github.com/argoroots/Screenwerk/archive/master.zip
git - https://git-scm.com/download
