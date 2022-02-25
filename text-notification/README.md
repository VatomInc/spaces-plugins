# Text Notification :iphone:

This plugin allows users to notify space hosts of their arrival to the space via SMS

## Usage :clipboard:

- **Step 1:** Host the plugin on a [CORS enabled](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) server, or upload the entire `text-notification` directory into your own space
  - If you are hosting the plugin on a server, you need to copy the full URL to the `index.js` file
  - To host the plugin in your own space, you can go to File -> Storage and click the top-right "upload" button
  - Once it has been uploaded, click on the `index.js` file and select "Copy URL"
- **Step 2:** Add the plugin to your space by clicking "Plugins" and scrolling to the bottom to click the "Add from URL" button. Paste the URL to the plugin here.

## Configuration :gear:

Once the plugin has been installed in your space, you can add up to five phone numbers you wish to be alerted when a user enters the space.

To add the numbers, do the following:
- Click "Plugins" in the top bar
- Find the "Text Notification" plugin and click the "Settings" button
- Add the phone numbers you wish to notify by using the [E.164 format](https://www.twilio.com/docs/glossary/what-e164)

```
[+][country code][area code][local phone number]
```

Here are some examples of phone numbers in [E.164 format](https://www.twilio.com/docs/glossary/what-e164)

| Country        | Country Code | Area Code | Local Phone Number | E.164 Format  |
| -------------- | -----------: | :-------: | :----------------- | :-----------: |
| United States  | +1           | 415       | 123 1234           | +14151231234  |
| South Africa   | +27          | 074       | 123 1234           | +27741231234  |
| United Kingdom | +44          | 020       | 1234 1234          | +442012341234 |
