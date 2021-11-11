# Coin Pickup Game

This plugin adds a game-like element to the SpatialWeb. It automatically drops "coins" which can then be collected
by users by walking over it. Each coin simply increases an overall score counter.

## Usage

**Step 1:** Register the plugin. You can do this by opening your Space as an admin, going to File -> Manage Plugins -> Add from URL and then entering this URL:

```
https://cdn.ydangleapps.com/hf/plugin-repo/plugins/coin-pickup-game/plugin.js
```

**Step 2:** Set up the plugin's scoring method. Go to File -> Manage Plugins, find the Coin Pickup Game plugin and click on Settings.

**Step 3:** Create the coin spawner. This can be any object, such as a cube, etc. Once you've created your object, right click on it and select Properties, then go to the bottom, select Add Component, and select the Collectible Coin Spawner. You can then edit it's properties or leave it on the default. Check the "Enabled" checkbox to start automatically spawning coins, or click "Spawn a coin now" to spawn one.

**Done!** Now you should see a coin counter in the top right, which increases as you walk over a coin.


## Example uses

- **Using VatomInc Campaigns for scoring:** You can use the VatomInc Campaign system to persist a user's score across sessions. Go to File -> Manage Plugins -> Coin Pickup Game -> Settings, select `Method: VatomInc Campaign`, and set a unique value for `VatomInc campaign ID`.

- **Spawning vatoms:** In order to spawn vatoms instead of just normal objects, you need a "master" vatom which has been marked as publicly readable, as well as having the AcquirePubVariation action registered on it. Once you have one of these vatoms, you can put it's vatom ID into the `Vatom ID` field, and leave `Coin Model` blank.

  When vatoms are spawned this way, if a user walks over one to pick it up, their client will send an AcquirePubVariation request to the vatom as part of the pickup process. This means they should get a copy of the master vatom in their wallet.