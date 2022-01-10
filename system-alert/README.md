# System Alert :warning:

This plugin allows an admin user to send a toast message to everyone in the space.

**NOTE**: Plugin only allows **admin** users to send messages to everyone, so if
you are not an admin, then you will not be able to use this plugin.

## Usage :clipboard:

- **Step 1:** Host the plugin on a [CORS enabled](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) server, or upload the entire `system-alert` directory into your own space
  - If you are hosting the plugin on a server, you need to copy the full URL to the `index.js` file
  - To host the plugin in your own space, you can go to File -> Storage and click the top-right "upload" button
  - Once it has been uploaded, click on the `index.js` file and select "Copy URL"
- **Step 2:** Add the plugin to your space by clicking "Plugins" and scrolling to the bottom to click the "Add from URL" button. Paste the URL to the plugin here.
- **Step 3:** Click the bottom "Admin" button and click "Alert".
- **Done!** You can now type any message into the popup and it will be displayed to everyone currently in the space. **NOTE**: It does not send the message to users who join the space *after* the message has been sent.
