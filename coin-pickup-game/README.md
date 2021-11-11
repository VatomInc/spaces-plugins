# Coin Pickup Game :moneybag:

This plugin adds a game-like element to the SpatialWeb. It automatically drops "coins" which can then be collected
by users by walking over it. Each coin simply increases an overall score counter.

## Usage :clipboard:

- **Step 1:** Host the plugin on a [CORS enabled](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) server, or upload the entire `coin-pickup-game` directory into your own space
  - If you are hosting the plugin on a server, you need to copy the full URL to the `index.js` file
  - To host the plugin in your own space, you can go to File -> Storage and click the top-right "upload" button
  - Once it has been uploaded, click on the `index.js` file and select "Copy URL"
- **Step 2:** Add the plugin to your space by clicking "Plugins" and scrolling to the bottom to click the "Add from URL" button. Paste the URL to the plugin here.
- **Step 3:** Configure the plugin. Click "Plugins", find the "Coin Pickup Game" plugin and click on the "Settings" button.
- **Step 4:** Create the coin spawner (can be any object, such as a cube). Once you've created your object, right click on it and select "Properties", then click "Components" and select "Add Component". Click on the "Collectible Coin Spawner" component. Check the "Enabled" checkbox to start automatically spawning coins, or click "Spawn New Coin" to spawn one.
- **Done!** Now you should see a coin counter in the top right, which increases as you walk over a coin.
