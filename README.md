# cnxn

cnxn (pronounced: "connection") is a highly experimental, realtime-focused, peer-to-peer networking library for client-side web apps. In a nutshell, it's realtime, serverless communication for website visitors.

## Concepts

cnxn builds on the existing peer-to-peer systems of IPFS with some key abstractions:

### Users

A user represents the person utilizing a device to access the network. Users can have multiple devices. They're identified by a publicly known ID and an encryption key pair which is present on all their devices.

### Manifest

A manifest is a small blob of metadata associated with each user which is broadcast and shared within the peer network. Only a user has authority to publish a new manifest, which is ensured by signing it with their key. However, any peer on the network might store and rebroadcast the manifest of any particular user to interested parties.

The manifest mostly consists of canonical links to the Profile and Vault of the user.

### Profile

A profile is public data associated with a particular user. The data stored is up to you. Profile data automatically syncs between a user's devices based on the most recently edited and available copy.

Profiles are also provided to all peers who connect to the user. A common use for a profile is a name and avatar.

### Vaults

A vault is like a manifest, but the information is not public. It's encrypted with the user's key and synced in a similar way. A vault can be used to store private settings which the user wants to take with them between devices.

## Use Cases

These are all just sketches right now. I like to sketch ideas like this before diving too deep into implementation so I know what I'm aiming for.

### Visitor Presence for Web

Imagine visiting a static website and being able to interact in realtime with other concurrent visitors. This is a bit of a novelty right now, but it's also one of the simpler use cases.

For example, perhaps you could broadcast the cursor position of each user to all the others, so you get a sense of presence when viewing a website.

#### How it works

Each visitor instantiates a cnxn client when they open the page. This client connects to a static, shared topic for pubsub (perhaps the name of the website, or a hardcoded unique string). Since all visitors are subscribed to the same shared topic, they can broadcast messages to one another. Everything is anonymous.

### Persistent Peer Relationships

Suppose we want to reach out across the internet and find people we are interested in to form a long-lived relationship which survives closing the browser. We need an 'address' at which we can reach them, and we need to be ready to listen on our own 'address.' We can store the addresses of people we care about in long-term storage, and when we notice them in the peer network, we can reach out to them directly.

#### How it works

Our 'address' is a unique peer ID, and we subscribe to that Peer ID as a pubsub channel. Now anyone can broadcast to that channel to reach us (and, we must remember, anyone else who is subscribed). To prevent messages meant for us from being read by others, message senders need to encrypt their messages with our public key. When we broadcast messages to our 'friends,' we also sign them with our key so they know it's from us.

Our address book can be stored in any long-term storage, like LocalForage or LevelDB. On startup, we read each address and subscribe to its pubsub topic. If the other user is online, we should find them in the peers connected to that topic - assuming network conditions are favorable...

### Serverless Device Sync

Suppose you have a JAMStack app or other static website and you want to seamlessly persist and sync user preferences or data across their devices. Whenever the user has two devices online, the one with more recent changes should push the data to the other.

#### How it works

To start, each device should generate or use a unique ID and subscribe to that pubsub topic. Our app should have some way to copy that ID and send it to another device - whether by QR code, or SMS, etc. After sending the ID to the second device, it should write over its own ID with the new one, so both devices are now 'on the same wavelength,' sharing an ID.

Upon starting up and connecting to this channel, each device should broadcast the latest copy of the data and its last changed time. If another device receives this message and has a later change time on its copy, it should respond with its own broadcast. After all broadcasts are settled, the latest broadcast copy of the data is stored in each device. The sync is complete.

Security is a separate issue, though. A unique ID is just security through obscurity. To prevent any old user from broadcasting bogus data to the channel, the data should be encrypted and signed with some shared secret which the user provides individually to each device, like a password.

Another solution might be to share encryption keys between devices and encrypt the sync traffic. Sharing keys might be accomplished using a mnemonic string or some external key store.

## Help Out

If you like the sound of this, let's talk. I'm kind of used to being a solo worker on these kinds of projects, so it may be an adjustment, but I hope that the vision of this project is worth forming a team around and I'm open to it.

Even just telling me why this won't work is great.
