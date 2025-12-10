# Fedishare
What is Fedishare? It's a simple library for querying Fediverse services and 
redirecting your website's visitors to their share page.

The Fediverse is an awesome set of interconnected services. But if you run a website and want to allow your users to share your articles--thing start to become *complicated*. 

That's why I built this library; to allow webmasters to integrate a simple <kbd>Share on the Fediverse</kbd> button that can sit right next to your *other* share buttons. (And that doesn't require 8 megabytes of "compiled" TypeScript and an additional 12 of bundled dependencies).

Here's my implementation.

![preview.png](The buttons I'm using on my website)

From left to right we see reddit followed by Lemmy, Mastodon, and a generic Fediverse button. The Lemmy, Mastodon, and Fediverse buttons are powered by this library. Functionally, they're exactly the same.

I built this for my website [The Bryant Review](https://gardinerbryant.com) and I wrote an article about my [implementation here](https://gardinerbryant.com/how-i-built-intelligent-fediverse-buttons-for-the-review/).

I'd love to hear your thoughts on this. I welcome collaborators, code contributions, and feature requests!


## Usage
How do you use this library? Just include `fedishare.js` in your site:

```html
<script src="share/fedishare.js"></script>
```

Then, add a button with a `data-share-service` attribute with one of the 
supported services.

```html
<button data-share-service="mastodon">Share on Mastodon</button>
```
> [!NOTE]
> It does not strictly need to be a button element.

Once you have a button, you can attach an onclick listener to it in JS:

```js
const button = document.querySelector(['data-share-service="mastodon"']);
button.addEventListener("click", () => {
  const fedi = new Fedishare(window.location, document.title, 'Some description. Could be the <meta property="og:description"> value or whatever you\'d like.');
  fedi.find(button, "An optional message to display under the input field");
})
```

## Testing
| Service       | Test Results  |
| ------------- | :-----------: |
| Calckey       | ❓    |
| Diaspora      | ❓    |
| Fedibird      | ❓    |
| Firefish      | ❓    |
| Foundkey      | ❓    |
| Friendica     | ❓    |
| Glitchcafe    | ❓    |
| GNUSocial     | ❓    |
| Hometown      | ❓    |
| Hubzilla      | ❓    |
| kbin          | ❓    |
| Lemmy         | ✅    |
| Mastodon      | ✅    |
| Meisskey      | ❓    |
| Microdotblog  | ❓    |
| Misskey       | ❓    |
| Peertube      | ❌    |

| Key                  |                              |          |
|----------------------|------------------------------|----------|
| ✅ Tested & Working | ❓ Supported but untested | ❌ Not supported |
