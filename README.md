# ScreenWerk 2014

SW14 uses node-webkit >= v0.3.0.**


### Supported attributes

#### Layout-Playlist

- ***loop***
  If set to true, loop property will propagate to **Playlist**. If not set or set to false, it will not propagate at all

#### Playlist

> By default **Playlist**s will not loop. If any parent **Layout-Playlist** has *loop* = true, **Playlist** will loop.
> May cause confusion (as unexpected looping), if same **Playlist** is used on multiple **Layout**s (on same **Screen**) but should loop on only some.

#### Playlist-Media
- ***mute***
  If set to true, *mute* property will propagate to **Media**. If not set or set to false, it will not propagate at all.
  
#### Media
> ***mute***: By default everything plays with sound. **Media** gets muted by parent **Playlist-Media**.
