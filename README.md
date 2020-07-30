# cnxn

cnxn is an experiment in a next-generation peer-to-peer social media app.

Right now it's basically a playground for p2p tech as I try to determine whether the vision is feasible.

## Vision

cnxn aims to achieve the following goals for a better version of social media:

1. Peer to peer. User data is never stored in a centralized place owned by a third party. All user content lives distributed among peers.
2. Present-focused. No doom scrolling, no embarrassing high school pictures. cnxn focuses on who's here now, and what they're doing today.
3. Private and personal. All messages are only visible to you and those you're talking to. No public comment sections. No resharing. No public likes. This is not an influencer platform. Influencers are just marketers that pretend they're friends.
4. Free and low-maintenance. Using the latest in peer-to-peer, the goal is to make cnxn free or incredibly cheap to provide to the world. The monetization strategy is to not cost me money. Avoid any and all pressure to exploit anyone through advertising or other user-hostile patterns to keep the lights running.

## Architecture

Very in flux right now. But the networking portion is _heavily_ inspired by [Bugout](https://github.com/chr15m/bugout) and I owe a lot to that project. Using Bittorrent as a public signalling service and media protocol is brilliant and I'm building on top of that idea heavily. If you're interested in building something peer-to-peer in the browser today I highly recommend checking it out.

cnxn takes a fork and rewrite of that code, adds more abstraction around joining peers, and builds on some generic media seeding / downloading functionality.

The app is React obviously. The state is currently Redux. I'm still working on how the React portions interact with the underlying p2p client.

## Help Out

If you like the sound of this, let's talk. I'm kind of used to being a solo worker on these kinds of projects, so it may be an adjustment, but I hope that the vision of this project is worth forming a team around and I'm open to it.

Even just telling me why this won't work is great.

## Developing

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

### Available Scripts

In the project directory, you can run:

#### `npm start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

#### `npm test`

Launches the test runner in the interactive watch mode.<br />
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

#### `npm run build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

#### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

### Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
