# Spotify ![Spotify](https://user-images.githubusercontent.com/43512442/141296249-5b783cd7-714f-408d-a09e-02a7d4f7ed95.png)

This plugin adds a spotify button to the bottom menu bar, so that you can listen to your own playlist inside your space.

## Usage :clipboard:

- **Step 1:** Host the plugin on a [CORS enabled](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) server, or upload the entire `spotify` directory into your own space
  - If you are hosting the plugin on a server, you need to copy the full URL to the `index.js` file
  - To host the plugin in your own space, you can go to File -> Storage and click the top-right "upload" button
  - Once it has been uploaded, click on the `index.js` file and select "Copy URL"
- **Step 2:** Add the plugin to your space by clicking "Plugins" and scrolling to the bottom to click the "Add from URL" button. Paste the URL to the plugin here.
- **Step 3:** In the plugins list, find the "Spotify" plugin and click the "Settings" button next to it. You can paste the link to the embedded playlist in the "URL" field. If you are unsure about how to get the embedded link for the Spotify playlist, see the section "Get Embedded Link" below.

## Get Embedded Link :link:

To get the embedded link for a Spotify playlist, follow the below steps:

1. Navigate to https://open.spotify.com/
2. Find the playlist you would like to use
3. Click the three horizontal dots next to the green play button
4. Select Share -> Embed playlist
5. Enable the "Show Code" checkbox and copy the URL that appears between `src="` and `"`
    - The URL should look something like this: https://open.spotify.com/embed/playlist/0vC2B4CRTQfTu899Jh0Cxf
6. Done! Now you can use that URL and apply it to Step 3 in the "Usage" section above
