<div align="center">

![TikTok Live MCBE](./docs/images/TikTokLiveMCBE.png)

# TikTokLiveMCBE

</div>

<p align="center">TikTokLiveMCBE is a simple tool that connects your TikTok Live stream with your Minecraft BE/PE.</p>

## Installation

### Prerequisites

Before you begin, ensure you have [Node.js](https://nodejs.org/) installed on your computer. If you're on an Android device, you can use Termux to run TikTokLiveMCBE.

#### Setup Tutorial on Termux

Click the image below to watch the full setup tutorial on YouTube!

<div align='center'>

[![Watch the video](https://img.youtube.com/vi/GQu1S_rnxkY/default.jpg)](https://youtu.be/GQu1S_rnxkY?feature=shared)

</div>

1. **Download the Latest Release**

Download the latest version of TikTokLiveMCBE. Look for the ZIP file in the list of assets.

> - [Download TikTokLiveMCBE](https://github.com/rqinix/TikTokLiveMCBE/releases/)
>
> **_Show your support by giving it a ⭐!_**

2. **Uncompress the ZIP File**

- Once the download is complete, extract the contents of the ZIP file to a folder of your choice.

3. **Navigate to the TikTokLiveMCBE Folder**

- Using your terminal or command prompt, navigate to the extracted folder. For example:

```bash
cd TikTokLiveMCBE
```

4. **Install the Dependencies**

```bash
npm install
```

or if you prefer Yarn, first install Yarn globally:
```bash
npm install --global yarn
```

Then install the dependencies:
```bash
yarn install
```

5. **Start the Server**

Start the TikTokLiveMCBE server:
```bash
npm start
```
or if you're using Yarn:
```bash
yarn start
```

TikTokLiveMCBE will prompt you to provide your TikTok username, port number (default is `3000`), and select your desired plugins from the available options.

```bash
Welcome to TikTokLiveMCBE!
✔ Enter TikTok username (must be live): rqinix
✔ Enter the port number: 3000
? Select plugins to activate: (Press <space> to select, <a> to toggle all, <i> to invert selection, and <enter> to
proceed)
❯◯ TNT Coin by Rqinix
```

```bash
Welcome to TikTokLiveMCBE!
✔ Enter TikTok username (must be live): rqinix
✔ Enter the port number: 3000
✔ Select plugins to activate: TNT Coin by Rqinix
✔ Connected to rqinix TikTok Live Stream.
Open Minecraft and run this command '/connect localhost:3000' to connect.
<Ctrl + C> to stop the server.
```

6. **Connect Minecraft to TikTokLiveMCBE**

Once TikTokLiveMCBE is successfully connected to the live stream, open Minecraft and connect to the server using the following command:

```bash
/connect localhost:3000
```

This command establishes the connection between Minecraft and TikTokLiveMCBE. Make sure the port matches the one configured during the setup process.

---

## Subscribing to Minecraft Events

You can subscribe to Minecraft events like this:
```ts
import { connection } from "./core/TikTokLiveMcbe.js";

const { tiktok, minecraft } = connection;

// Subscribe to Minecraft Events
minecraft.subscribeToEvents([
    "PlayerMessage",
    "BlockBroken",
    "BlockPlaced",
    // ... other events
]);

// Handle Events

minecraft.on("PlayerMessage", (data) => {

    console.log(`PlayerMessage Event: ${data}`);

});

minecraft.on("BlockBroken", (data) => {

    console.log(`BlockBroken Event: ${data}`);

});

minecraft.on("BlockPlaced", (data) => {

    console.log(`BlockPlaced Event: ${data}`);

});

// ...
```

Whenever a player sends a message, breaks a block, or places a block, these events will be triggered, and the corresponding code will be executed, such as logging the event data to the console.

For example, when a PlayerMessage event is triggered, the event data is logged as follows:
```ts
console.log(`PlayerMessage Event: ${data}`);
```

This will output the following in the console:
```bash
PlayerMessage Event: {"body":{"message":"hello","receiver":"","sender":"Steve","type":"chat"},"header":{"eventName":"PlayerMessage","messagePurpose":"event","version":17039360}}
```

Similarly, for the BlockBroken event:
```ts
console.log(`BlockBroken Event: ${data}`);
```

The console output will look like this:
```bash
BlockBroken Event: {"body":{"block":{"aux":0,"id":"grass_block","namespace":"minecraft"},"count":1,"destructionMethod":0,"player":{"color":"ffededed","dimension":0,"id":-4294967295,"name":"Steve","position":{"x":2.987498283386230,"y":-56.45503997802734,"z":14.11897277832031},"type":"minecraft:player","variant":0,"yRot":-95.82889556884766},"tool":{"aux":0,"enchantments":[],"freeStackSize":0,"id":"iron_pickaxe","maxStackSize":1,"namespace":"minecraft","stackSize":1},"variant":0},"header":{"eventName":"BlockBroken","messagePurpose":"event","version":17039360}}
```

And for the BlockPlaced event:
```ts
console.log(`BlockPlaced Event: ${data}`);
```

This will output:
```bash
BlockPlaced Event: {"body":{"block":{"aux":0,"id":"diamond_block","namespace":"minecraft"},"count":1,"placedUnderWater":false,"placementMethod":0,"player":{"color":"ffededed","dimension":0,"id":-4294967295,"name":"Steve","position":{"x":11.93433761596680,"y":-56.45503997802734,"z":13.82549858093262},"type":"minecraft:player","variant":0,"yRot":-95.34191131591797},"tool":{"aux":0,"enchantments":[],"freeStackSize":0,"id":"diamond_block","maxStackSize":64,"namespace":"minecraft","stackSize":64}},"header":{"eventName":"BlockPlaced","messagePurpose":"event","version":17039360}}
```

## Sending Minecraft Commands

```ts
minecraft.sendCommand('say hello, world!');
```

## Handling TikTok Events

You can also handle TikTok events, such as receiving gifts, likes, chats and follows, as shown below:

```ts
import { connection } from "./core/TikTokLiveMcbe.js";

const { tiktok, minecraft } = connection;

// ...

tiktok.events.onGift(data => {
    // If this is a streakable gift and the streak is NOT ending, handle it temporarily
    if (data.giftType === 1 && !data.repeatEnd) {
        minecraft.sendCommand(`say ${data.uniqueId} is sending gift ${data.giftName} x${data.repeatCount} (streak in progress)`);
        return;
    }

    // Otherwise, process the gift (final count, send Minecraft message, etc.)
    const { giftName, uniqueId, nickname } = data;
    minecraft.sendCommand(`tellraw @a {"rawtext":[{"text":"§a§l${nickname} §7has sent §a§l${giftName} x${data.repeatCount}"}]}`);
});

tiktok.events.onChat(data => {
    const { uniqueId, nickname, comment } = data;
    minecraft.sendCommand(`tellraw @a {"rawtext":[{"text":"§a§l${nickname} §7says: §a§l${comment}"}]}`);
});

tiktok.events.onLike(data => {
    const { uniqueId, nickname, likeCount } = data;
    minecraft.sendCommand(`tellraw @a {"rawtext":[{"text":"§a§l${nickname} §7liked the stream §a§l${likeCount} times!"}]}`);
});

tiktok.events.onFollow(data => {
    const { uniqueId, nickname } = data;
    minecraft.sendCommand(`tellraw @a {"rawtext":[{"text":"§a§l${nickname} §7has followed the stream!"}]}`);
});

tiktok.events.onShare(data => {
    const { uniqueId, nickname } = data;
    minecraft.sendCommand(`tellraw @a {"rawtext":[{"text":"§a§l${nickname} §7has shared the stream!"}]}`);
});

// ...
```

## Creating Plugins for TikTokLiveMCBE

TikTokLiveMCBE supports custom plugins to extend its functionality. Each plugin must have its own folder containing two files:

1. `manifest.json`
- This file describes the plugin's metadata.

Below is an example:
```
{
  "name": "My Custom Plugin",
  "version": "1.0.0",
  "description": "A custom plugin for TikTokLiveMCBE.",
  "author": "Your Name"
}
```

Ensure `manifest.json` includes `name`, `version`, `description`, and `author`.

2. `main.ts` or `main.js`
- Contains the plugin's logic. Example:
```js
import { TikTokLiveMCBE } from "../../core/TikTokLiveMcbe.js";

export function plugin(tiktokLiveMcbe: TikTokLiveMCBE): void {
    const { tiktok, minecraft } = tiktokLiveMcbe;

    console.log('Hello TikTokLiveMCBE');

    minecraft.on("connected", () => {
        const data = { tiktokUserName: tiktok.username };
        minecraft.sendCommand(`tellraw @a {"rawtext":[{"text":"LOL"}]}`);
    });
}
```

#### Plugin Folder Structure

```
plugins/
├── MyCustomPlugin/
│   ├── manifest.json
│   └── main.ts
```

### Submitting Your Plugin
If you’ve created a plugin that you’d like to share with the community, feel free to open a pull request or contribute to the TikTokLiveMCBE repository.

## Contributing

Feel free to contribute by submitting issues or pull requests. Any improvements or new features are welcome!
