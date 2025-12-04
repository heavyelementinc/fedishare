# Fedishare
What is Fedishare? It's a simple library for querying Fediverse servies and 
redirecting your website's visitors to supported share pages.

I built this for my website [The Bryant Review](https://gardinerbryant.com) and 
I wrote an article about my [implementation here](https://gardinerbryant.com/how-i-built-intelligent-fediverse-buttons-for-the-review/).

I'd love to hear your thoughts on this, I welcome collaborators, and feature
requests!


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
  const fedi = new Fedishare(window.location, document.title, 'Some description. Could be the <meta rel="og:description"> value or whatever you\'d like.');
  fedi.find(button, "An optional message to display under the input field");
})
```

> [!NOTE]
> I've only tested that the share buttons work on mastodon.online and lemmy.world since I only have accounts on those servers.