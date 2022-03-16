# Pickups :pinching_hand:

These plugins allow you create objects that can be picked up and gives various bonuses
to the user.

## Examples :open_file_folder:

| Name                | Description | Example |
| ------------------- | ----------- | ------- |
| Ammo                | Allows picking up ammo | [Here](./ammo-pickup/) |
| Armor               | Allows picking up armor | [Here](./armor-pickup/) |
| Damage              | Allows picking up a damage multiplier | [Here](./damage-pickup/) |
| Health              | Allows picking up health | [Here](./damage-pickup/) |
| Health Regeneration | Allows picking up health regeneration | [Here](./health-regeneration-pickup/) |

## Usage :clipboard:

- **Step 1:** Host the plugin on a [CORS enabled](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) server, or upload the entire directory of the pickup you want into your own space (e.g. `ammo-pickup`)
  - If you are hosting the plugin on a server, you need to copy the full URL to the `index.js` file
  - To host the plugin in your own space, you can go to File -> Storage and click the top-right "upload" button
  - Once it has been uploaded, click on the `index.js` file and select "Copy URL"
- **Step 2:** Add the plugin to your space by clicking "Plugins" and scrolling to the bottom to click the "Add from URL" button. Paste the URL to the plugin here.
- **Step 3:** Create or find an object (can be any object, such as a cube). Once you have an object, right click on it and select "Properties", then click "Components" and select "Add Component". Click on the component related to the pickup plugin you installed. Edit the properties as you see fit.
- **Done!** Now you when you get close to this object, the relevant pickup will be picked up.
