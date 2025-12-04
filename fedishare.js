import Modal from "./modal";

const endpointDetails = {
  "calckey": {
    endpoint: "share?text={body}",
  },
  "diaspora": {
    endpoint: "bookmarklet?title={title}&notes={description}&url={url}",
    charLimit: 200,
  },
  "fedibird": {
    endpoint: "share?text={body}",
    charLimit: 200,
  },
  "firefish": {
    endpoint: "share?text={body}",
    charLimit: 200,
  },
  "foundkey": {
    endpoint: "share?text={body}",
    charLimit: 200,
  },
  "friendica": {
    endpoint: "compose?title={title}&body={description}%0A{url}",
    charLimit: 200,
  },
  "glitchcafe": {
    endpoint: "share?text={body}",
    charLimit: 200,
  },
  "gnusocial": {
    endpoint: "notice/new?status_textarea={body}",
    charLimit: 200,
  },
  "hometown": {
    endpoint: "share?text={body}",
    charLimit: 200,
  },
  "hubzilla": {
    endpoint: "rpost?title={title}&body={description}%0A{url}",
    charLimit: 200,
  },
  "kbin": {
    endpoint: "new/link?url={url}",
    charLimit: 200,
  },
  "lemmy": {
    endpoint: "create_post?url={url}&title={title}&body={description}",
    charLimit: 200,
  },
  "mastodon": {
    endpoint: "share?text={body}",
    charLimit: 200,
  },
  "meisskey": {
    endpoint: "share?text={body}",
    charLimit: 200,
  },
  "microdotblog": {
    endpoint: "post?text=[{title}]({url})%0A%0A{description}",
    charLimit: 200,
  },
  "misskey": {
    endpoint: "share?text={body}",
    charLimit: 200,
  },
};

class Fedishare {

  title = "";
  description = "";
  href = "";
  message = "";
  originalButton = "";
  localStorageKey = "";

  constructor(href, title, description) {
    this.title = title;
    this.description = description;
    this.href = href;
  }

  async find(button, message = "") {
    // Store the button that was originally pressed
    this.originalButton = button; 
    this.message = message;
    
    // Get our service name
    const service = button?.dataset.shareService ?? "generic";

    // Define the key we'll use to restore our answer in localStorage
    this.localStorageKey = `gh-share-${service}`;

    // Let's prompt the user for their Fediverse details
    let host = await this.prompt(service, button);
    if(!host) return;
    
    // Check if the user has provided us with just the hostname, prepend with "https" 
    if(typeof host == "string" && host.indexOf("http") !== 0) host = `https://${host}`;
    
    // Build a URL out of the user's response
    const url = new URL(host);
    this.discoverShareEndpoint(url);
    window.shareWidget.track(button);
  }

  /** @param {URL} host */
  async discoverShareEndpoint(host) {
    try {
      // Fetch the details from the user
      this.nodeInfo = await fetch(`${host.protocol}//${host.host}/.well-known/nodeinfo`);
      this.nodeInfo = await this.nodeInfo.json();
      // 
      this.application = await fetch(this.nodeInfo.links[0].href);
      this.application = await this.application.json();
    } catch (error) {
      this.prompt(this.service, this.originalButton, `<span style="color: red">Something went wrong. Please try again.</span>`);
      return;
    }
    if(this.application?.software?.name in endpointDetails === false) {
      return shareWidget.fedi(this.originalButton, `<small style="color: red">Unknown or unsupported service!</small>`);
    }
    if("localStorage" in window && localStorage.setItem(this.localStorageKey, `${host.protocol}//${host.host}`));
    this.open(host, this.application.software.name);
  }

  /**
   * @param {URL} url 
   * @param {string} software 
   */
  open(url, software) {
    if(software in endpointDetails == false) return this.prompt(`<span color="red">"${software}" is not a supported Fediverse service.</span>`, "Ok", "Cancel", "bool");
    let endpoint = endpointDetails[software].endpoint;
    endpoint = endpoint.replaceAll("{body}", encodeURIComponent(`${this.title}\n${this.description}\n${this.href}`));
    endpoint = endpoint.replaceAll("{title}", encodeURIComponent(this.title).replaceAll("{description}", this.description));
    endpoint = endpoint.replaceAll("{url}", encodeURIComponent(this.href));

    window.open(`${url.protocol}//${url.host}/${endpoint}`
      , 'target', 'toolbar=no,location=no,status=no,menubar=no,width=550,height=720');
  }

  async prompt(service, button, message = "") {
    // Create our modal box
    const modal = new Modal();
    let serviceName = "Fediverse";
    let example = "https://mastodon.social";
    let icon = null;
    if(button) {
      icon = button.querySelector("svg")?.parentNode.innerHTML;
      // modal.dialog.style.backgroundColor = button.backgroundColor;
      // modal.dialog.style.color = button.color;
    }
    
    switch(service) {
      case "mastodon":
        serviceName = "Mastodon";
        example = "https://mastodon.online";
        break;
      case "lemmy":
        serviceName = "Lemmy";
        example = "https://lemmy.world";
        break;
    }

    let value = "";
    if("localStorage" in window && localStorage.getItem(this.localStorageKey)) {
      value = localStorage.getItem(this.localStorageKey);
    }

    // modal.dialog.dataset.shareService = service;
    if(!this.message) this.message = `<small style="color: rgb(from currentColor r g b / .5)">For example: ${example}</small>`;
    const result = await modal.prompt(`<div class="icon">${icon}</div><p>Domain name of your ${serviceName} server?</div>`, "string", this.message, value);
    
    return result;
  }
}