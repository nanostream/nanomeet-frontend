# nanoMeet Developer Guide

&copy; 2021 [nanocosmos](www.nanocosmos.de)



## Getting started

This guide will help you to integrate nanoMeet into your development environment. 
Embedding nanoMeet into your web page, using our Web API enables you to provide secure video meetings and broadcast them around the world in 1 second.



**nanoMeet online samples:**

[Token Creator](https://nanomeet.pages.nanocosmos.de/nanomeet-frontend/nanomeet-helper.html?bintu.apikey=YOUR-API-KEY&nanomeet.room=YOUR-ROOM-NAME) - Click [here](nanomeet-helper.html) to find the code.

[NanoMeet Sample](https://nanomeet.pages.nanocosmos.de/nanomeet-frontend/nanomeet-sample.html?token=YOUR-INVITE-TOKEN) - Click [here](nanomeet-sample.html) to find the code.



### Embedding nanoMeet on your own web page

You can embed the following code snippet to test nanoMeet on your page in no time. It is a recommended example and runs on any web page. 



> **Note**: To make this code snippet run, you need to **create a new nanoMeet room first**. When executing this step via the [nanoMeet web API](#createNanoMeetRoom) method or our [sample](https://nanomeet.pages.nanocosmos.de/nanomeet-frontend/nanomeet-helper.html?bintu.apikey=YOUR-API-KEY&nanomeet.room=YOUR-ROOM-NAME) a **new secure invite token** is generated that can be used to enter a nanoMeet room.



```html
// Code to embed a nanoMeet meeting room on a web page
<div id="nanoStream-meet"></div>
<script src="https://nanomeet.pages.nanocosmos.de/nanomeet-frontend/js/nanomeet.js"></script>
<script src="https://nanomeet-eu.nanocosmos.de/external_api.js"></script>
<!-- The div element the nanoMeet room will be embedded into -->
<script>
    var nanoMeet = new NanoMeet(); // Instance of the nanoMeet web API
    var token = "SECURE-TOKEN" // Your secure invite token

    // Initialization of the nanoMeet player
    document.addEventListener('DOMContentLoaded', function () {
        nanoMeet.init({ token, id: "nanoStream-meet" })
            .then((success) => {
                console.log("nanoMeet setted up...", success);
            }).catch((error) => {
                console.log("Error setting up nanoMeet", error);
            });
    })
</script>
```



## NanoMeet Web API



### NanoMeet

NanoMeet Public Web API Class 1.0.0.

**Kind:** global class

**Version:** 1.0.0.



**Integration**

To integrate nanoMeet in your web page you need to load our nanoMeet Web API.

**Example**

```html
<script src="https://nanomeet.pages.nanocosmos.de/nanomeet-frontend/js/nanomeet.js"></script>
<script src="https://nanomeet-eu.nanocosmos.de/external_api.js"></script>
```



**new NanoMeet()**

The instance of the NanoMeet web API. The source can be loaded via script tag.

**Example**

```js
var nanoMeet = new NanoMeet();
```



**nanoMeet.createNanoMeetRoom(apiKey, roomSetUp) => `Promise.<success|error>`**

Creates a secure token that is needed to initialize and use nanoMeet.

**Kind:** Instance of the  `NanoMeet`

| Param                | Type      | Description                                                  |
| -------------------- | --------- | ------------------------------------------------------------ |
| apiKey               | `String`  | Your nanoStream Cloud/bintu API key.                         |
| roomSetUp            | `Object`  | The custom configuration for your custom nanoMeet room.      |
| roomSetUp.nbf        | `String`  | The not before date for the secure token in ISO format.      |
| roomSetUp.exp        | `String`  | The expiration date for the secure token in ISO format.      |
| roomSetUp.streamname | `String`  | A passthrough streamname.                                    |
| roomSetUp.server     | `String`  | The server URL.                                              |
| roomSetUp.room       | `String`  | The room name. Valid Charset: a-z, A-Z, 0-9, _               |
| roomSetUp.moderator  | `Boolean` | If true the token gives the user permissions to create invite token, kick participants out and start the broadcast. |

**Example `roomSetUp` Properties**

```js
var roomSetUp = {
    nbf: "2021-01-22T06:00:01.000Z",
    exp: "2021-01-29T06:00:01.000Z",
    streamname: "XXXXX-YYYYY",
    room: "my_nanoMeet_room",
  	server: "nanomeet-eu.nanocosmos.de",
    moderator: true
}
```

**Example** 

```js
// Creation of a nanoMeet room
nanoMeet.createNanoMeetRoom(apikey, roomSetUp)
.then((success) => {
    console.log("nanoMeet room:", success)
}).catch((error) => {
    console.log("Error in creating a nanoMeet room:", error)
})
```

**Success Response**

```js
data: {
	expiration: "2021-01-29T06:00:01.000Z",
  moderator: true,
  notbefore: "2021-01-22T06:00:01.000Z",
  room: "my_nanoMeet_room",
  server: "nanomeet-eu.nanocosmos.de",
  streamname: "XXXXX-YYYYY",
  token: "SECURE-TOKEN" // secure token that needs to be provided when initializing nanoMeet on your webpage or creating an invite token
}
```



**nanoMeet.createInviteToken(token, tokenSetup) => `Promise.<success|error>`**

Creates an invite token for the nanoMeet room.

**Kind:** Instance of the  `NanoMeet`

| Param                | Type      | Description                                                  |
| -------------------- | --------- | ------------------------------------------------------------ |
| token                | `String`  | A valid token with moderator rights for the room.            |
| tokenSetup.moderator | `Boolean` | If true the token gives the user permissions to create invite token, kick participants out and start the broadcast. |
| [tokenSetup.nbf]     | `String`  | The not before date for the secure token in ISO format. If it is not provided it will be the same as the date passed to the token. |
| [tokenSetup.exp]     | `String`  | The expiration date for the secure token in ISO format. If it is not provided it will be the same as the date passed to the token. |

**Example `tokenSetup` Properties**

```js
tokenSetup: {
  token: "SECURE-TOKEN",
  moderator: false,
  exp: "2021-01-29T06:00:01.000Z",
  nbf: "2021-01-22T06:00:01.000Z",
}
```

**Example**

```js
// Creation of an invite token
nanoMeet.createInviteToken(token, tokenSetup)
.then((success) => {
    console.log("Successful creation of a nanoMeet secure invite token:", success);
}).catch((error) => {
    console.log("Error in creating a nanoMeet invite token:", error);
});
```

**Success Response**

```js
data: {
  moderator: false,
  token: "SECURE-TOKEN", // secure token that needs to be provided to the invitee
  inviteLink: "https://nanomeet.pages.nanocosmos.de/nanomeet-frontend/nanomeet-sample.html?token=token" // invite link to our nanoMeet sample
}
```



**nanoMeet.init(config) => `Promise.<(success|error)>`**

Initializes nanoMeet with the provided config object.

**Kind:** Instance of the  `NanoMeet`

| Param             | Type     | Description                                                  |
| ----------------- | -------- | ------------------------------------------------------------ |
| config            | `Object` | The config object for nanoMeet including the secure token, id and styles. |
| config.token      | `String` | A valid secure token.                                        |
| config.id         | `String` | The ID of the div element the nanoMeet window will be embedded into. |
| [config.height]   | `Number` | The height of the nanoMeet window. Default is 100%. <br />**Note:** The height you initialized can not be updated after you set it in the config. For dynamic changes regarding the height use the *config.id* selector (e.g. #nanoStream-meet { height: 500px; }). |
| [config.width]    | `Number` | The width of the nanoMeet window. Default is 100%.<br />**Note:** The width you initialized can not be updated after you set it in the config. For dynamic changes regarding the width use the *config.id* selector (e.g. #nanoStream-meet { width: 500px; }). |
| [config.branding] | `String` | The branding URL that refers to a JSON file that brands nanoMeet. Default is nanocosmos branding. |

**Example `config` Properties**

```js
config: {
  token: "SECURE-TOKEN",
  id: "nanoStream-meet",
  height: 500,
  width: 500,
  branding: "https://nanomeet.pages.nanocosmos.de/nanomeet-frontend/nanomeet-branding.json"
}
```

**Example**

```js
// Initialization of nanoMeet
nanoMeet.init(config)
    .then((success) => {
    console.log("nanoMeet setted up:", success);
}).catch((error) => {
    console.log("Error setting up nanoMeet:", error);
});
```

**Success Response**

```js
data: {
	moderator: true 
}
```



**nanoMeet.startBroadcast(isVOD) => `Promise.<(success|error)>`**

Starts a new broadcast. Can only be used if the `nanoMeet.init(config)` method was called before.

**Kind:** Instance of the  `NanoMeet`

| Param | Type      | Description                                                  |
| ----- | --------- | ------------------------------------------------------------ |
| isVOD | `Boolean` | If true, the live stream will be available as VOD after stopping. |

**Example**

```js
// Initialization of nanoMeet
nanoMeet.startBroadcast(isVOD)
    .then((success) => {
    console.log("Starting broadcast of nanoMeet conference:", success);
    console.log("Recording nanoMeet live stream:", isVOD);
}).catch((error) => {
    console.log("Error starting broadcast:", error);
});
```

**Success Response**

```js
data: {
  playout: {
  	live: "https://demo.nanocosmos.de/nanoplayer/....",
    vod: "https://bintu-vod.nanocosmos.de...."
  }
}
```



**nanoMeet.stopBroadcast() => `Promise.<(success|error)>`**

Stops a running broadcast. 

**Kind:** Instance of the  `NanoMeet

**Example**

```js
// Initialization of nanoMeet
nanoMeet.stopBroadcast()
    .then((success) => {
    console.log("Stopped broadcast");
}).catch((error) => {
    console.log("Error in stopping broadcast.");
});
```



### Support

Please use https://www.nanocosmos.de/support or support(at)nanocosmos.de for further assistance.

