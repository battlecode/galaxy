<!-- TODO tracked in #49, expand this til nothing for this doc readily, easily comes to mind. In particular, _during onboarding session, take an audio recording_ and then use that to type this up after. -->

# Codebase Intro and Guide

(with much help from Maggie Yao)

<!-- TODO in this PR... sketch this out more. Need to be concise somehow. Need to be organized, somehow!
Consider linking Maggie's docs. Although really, everything relevant should be here.
Most of all, this should be _ready for onboarding writeups._ -->

<!-- TODO also looking at the organization... and wondering how to make more readable -->

**If you are trying to make code changes here, make sure to read all the (sub)sections called "Technical Detail".** _If you're not trying to make code changes but just need some working knowledge, then feel free to skip over those sections._ It's helpful but not necessary.

The intent of this page is to discuss technical parts just enough, to get people started or reduce confusion. Feel free to change this and add more detail as it might be helpful (although it should probably go into other pages).

_(Note to editors / maintainers of this page: If you need to explain a subject, no need to reinvent the wheel! Linking to a reputable tutorial should be just fine.)_

## General web dev

General principles and packages of web programming, that Battlecode uses.

### What is a Frontend?

A "frontend" is, in general, the part of an application which the users interacts with.

In the Battlecode website, on a high level, the frontend takes in URLs from the user’s address bar, and returns rendered webpages to the user. The browser's process of loading and rendering these pages involves HTTP requests to the backend server. (The backend takes in these requests, and returns information.)

These two servers run independently of one another, and do not inherently share any information. Instead, communication is achieved through those HTTP requests.

### NPM

NPM, the Node Package Manager, is an online repository of JS packages, and a way to download and use them. It also exposes some helpful utilities.

Amazing tutorials can be found at https://www.freecodecamp.org/news/what-is-npm-a-node-package-manager-tutorial-for-beginners/ and at https://nodesource.com/blog/an-absolute-beginners-guide-to-using-npm/. I would highly recommend using them!

To run the frontend locally, you'll need to install the NPM CLI (command-line interface). See `local-setup.md` for more.

When installing a new Node package, always `npm install --save <package>`, and commit `package.json` and `package-lock.json`.

Our local processes use `npm start` and/or `npm run start`. These commands automatically use `.env.development`, and not `.env.production`. See here for more information: https://create-react-app.dev/docs/adding-custom-environment-variables/#what-other-env-files-can-be-used.

Here's a good tutorial to NPM, that should give you all you need. (It might actually give too much detail -- feel free to strip down as necessary.) [https://www.freecodecamp.org/news/what-is-npm-a-node-package-manager-tutorial-for-beginners/](https://www.freecodecamp.org/news/what-is-npm-a-node-package-manager-tutorial-for-beginners/)

Another useful source: [https://nodesource.com/blog/an-absolute-beginners-guide-to-using-npm/](https://nodesource.com/blog/an-absolute-beginners-guide-to-using-npm/)

### React

React is a popular JS framework. It's great! Turning html components into variables that are manipulatable in code is great.

If you don't have any React knowledge at all, then you should familiarize yourself with the basics. There are plenty of tutorials to get you up to speed. I enjoy React's official tutorial, here: https://reactjs.org/tutorial/tutorial.html. **In particular, make sure you read up to (and including) the Overview section**.

From the tutorial, you'll want to at least familiarize yourself with:

- what components are, and what the render method is

- what props are and what state is, and when components re-render

There's a couple other parts of React that we use heavily, that are not directly in the turorial. _These aren't strictly needed to start, but do come back to them if they come up._

You may want to know how conditional rendering works -- depending on what you do, it might come up. Here's a good explanation: https://reactjs.org/docs/conditional-rendering.html

TODO notes about react routes, and how our code takes in URLs and determines what to actually return. Link: https://reactrouter.com/en/main/route/route.


### JQuery

You actually probably don't need to know how JQuery works, other than how its API is exposed as a dollar sign object. TODO good links? tracked in #49

### APIs and the Web

### HTTP Requests

What is? TODO Link to a small explanation. tracked in #49
Note that this is a thing for backend and frontend!


TODO link to a small explanation. tracked in #49

### Async, Promises, and Callbacks

TODO one-sentence description if at all. tracked in #49

TODO link to a small explanation. tracked in #49

Any linked explanation or explnation we write ought to discuss

- at a high level, what async programming is
- promises in vanilla JS first,
- and then how JQuery's AJAX works

## Battlecode-specific web dev

Here are (some) specifics about Battlecode's frontend -- about how the codebase is set up, how it works, etc.

This will be developed over time, as the new frontend is developed, too.


<!-- ## Legacy stuff

The following are legacy notes from the old frontend. Copy-paste as you please.

### Injection from the root up

So first, from the bottom, what creates our pages? Ultimately, our page is `public/index.html` with some js running.

#### Technical Detail

We serve, _at first_, a static webpage. Go to `public/index.html` to see it. It contains simply a div called "root", and also a lot of imports. Many of those imports are third-party imports, of CSS/JS that we pull from external websites, or that we have downloaded but made some small tweaks to. See the `public` folder.

But note also `src/index.js`, and especially its last few lines, is run on `public/index.html`. Look up how injecting a react root works (and add a link, or Nathan can dig it up too). I forget the end result, but basically, the js at `src/index.js` is shoved into that div called "root".

### Routes

#### Technical Detail

See `src/index.js` for how we expose a single-page app, with routes and matching components, and especially to see how we only expose some routes.

Our API hits backend, and sometimes hits other external sites too
 -->
