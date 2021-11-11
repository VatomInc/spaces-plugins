# Portal :hole:

This plugin allows users to teleport to different areas (within a space) using a portal.

## Usage :clipboard:

- **Step 1:** Host the plugin on a [CORS enabled](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) server, or upload the entire `portal` directory into your own space
  - If you are hosting the plugin on a server, you need to copy the full URL to the `index.js` file
  - To host the plugin in your own space, you can go to File -> Storage and click the top-right "upload" button
  - Once it has been uploaded, click on the `index.js` file and select "Copy URL"
- **Step 2:** Add the plugin to your space by clicking "Plugins" and scrolling to the bottom to click the "Add from URL" button. Paste the URL to the plugin here.
- **Step 3:** Right click on an object that you want to make into a portal and select "Properties", then click "Components" and click "Add Component". Click on the "Portal" component.
- **Step 4:** Right click on a different object and repeat the process in Step 3.
- **Step 5:** Make sure the two objects you added the "Portal" component to have the same value for "Group ID", so that you can teleport between them.
- **Done!**: Now you should be able to walk into the one object to teleport to the other object.
