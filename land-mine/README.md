# Land Mine :bomb:

This plugin adds the capability to create explosive proximity mines.

Any object can be turned into a land mine by simply attaching the land mine
component to that object. Factors such as detonation range, explosive power, etc.
can be customized in the component.

## Usage :clipboard:

- **Step 1:** Host the plugin on a [CORS enabled](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) server, or upload the entire `land-mine` directory into your own space
  - If you are hosting the plugin on a server, you need to copy the full URL to the `index.js` file
  - To host the plugin in your own space, you can go to File -> Storage and click the top-right "upload" button
  - Once it has been uploaded, click on the `index.js` file and select "Copy URL"
- **Step 2:** Add the plugin to your space by clicking "Plugins" and scrolling to the bottom to click the "Add from URL" button. Paste the URL to the plugin here.
- **Step 3:** Create or find an object (can be any object, such as a cube). Once you have an object, right click on it and select "Properties", then click "Components" and select "Add Component". Click on the "Land Mine" component. Edit the land mine properties as you see fit.
- **Done!** Now you when you get too close to this object, it will explode and you will be launched into the air. 
