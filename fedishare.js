class Fedishare {

  title = "";
  description = "";
  href = "";
  message = "";
  originalButton = "";
  localStorageKey = "";
  WIDTH = 550;
  HEIGHT = 720;

  endpointDetails = {
    "calckey": {
      endpoint: "share?text={body}",
      charLimit: null,
      width: null,
      height: null,
    },
    "diaspora": {
      endpoint: "bookmarklet?title={title}&notes={description}&url={url}",
      charLimit: null,
      width: null,
      height: null,
    },
    "fedibird": {
      endpoint: "share?text={body}",
      charLimit: null,
      width: null,
      height: null,
    },
    "firefish": {
      endpoint: "share?text={body}",
      charLimit: null,
      width: null,
      height: null,
    },
    "foundkey": {
      endpoint: "share?text={body}",
      charLimit: null,
      width: null,
      height: null,
    },
    "friendica": {
      endpoint: "compose?title={title}&body={description}%0A{url}",
      charLimit: null,
      width: null,
      height: null,
    },
    "glitchcafe": {
      endpoint: "share?text={body}",
      charLimit: null,
      width: null,
      height: null,
    },
    "gnusocial": {
      endpoint: "notice/new?status_textarea={body}",
      charLimit: null,
      width: null,
      height: null,
    },
    "hometown": {
      endpoint: "share?text={body}",
      charLimit: null,
      width: null,
      height: null,
    },
    "hubzilla": {
      endpoint: "rpost?title={title}&body={description}%0A{url}",
      charLimit: null,
      width: null,
      height: null,
    },
    "kbin": {
      endpoint: "new/link?url={url}",
      charLimit: null,
      width: null,
      height: null,
    },
    "lemmy": {
      endpoint: "create_post?url={url}&title={title}&body={description}",
      charLimit: null,
      width: null,
      height: null,
    },
    "mastodon": {
      endpoint: "share?text={body}",
      charLimit: null,
      width: null,
      height: null,
    },
    "meisskey": {
      endpoint: "share?text={body}",
      charLimit: null,
      width: null,
      height: null,
    },
    "microdotblog": {
      endpoint: "post?text=[{title}]({url})%0A%0A{description}",
      charLimit: null,
      width: null,
      height: null,
    },
    "misskey": {
      endpoint: "share?text={body}",
      charLimit: null,
      width: null,
      height: null,
    },
  };

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

  async prompt(service, button, message = "") {
    // Create our modal box
    const modal = new Modal();
    
    // Establish our friendly names and examples
    let serviceName = "Fediverse";
    let example = "https://mastodon.social";
    let icon = null;

    if(button) {
      icon = button.querySelector("svg")?.parentNode.innerHTML;
      // modal.dialog.style.backgroundColor = button.backgroundColor;
      // modal.dialog.style.color = button.color;
    }
    
    // Check for known services
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

    // Restore our stored valued (if one exists)
    let value = "";
    if("localStorage" in window && localStorage.getItem(this.localStorageKey)) {
      value = localStorage.getItem(this.localStorageKey);
    }

    // Display the message if we've been passed one
    if(!this.message) this.message = `<small style="color: rgb(from currentColor r g b / .5)">For example: ${example}</small>`;

    // Finally, let's wait for a prompt
    const result = await modal.prompt(`<div class="icon">${icon}</div><p>Domain name of your ${serviceName} server?</div>`, "string", this.message, value);
    
    return result;
  }

  /** @param {URL} host */
  async discoverShareEndpoint(host) {
    try {
      // Fetch the details from the user
      this.nodeInfo = await fetch(`${host.protocol}//${host.host}/.well-known/nodeinfo`);
      this.nodeInfo = await this.nodeInfo.json();
      // Fetch the node software details
      this.application = await fetch(this.nodeInfo.links[0].href);
      this.application = await this.application.json();
    } catch (error) {
      // If there was an error, let's tell the user about it.
      this.prompt(this.service, this.originalButton, `<span style="color: red">Something went wrong. Please try again.</span>`);
      return;
    }

    // Check if this is actually a fediverse service
    if(!this.application?.software?.name) {
      return shareWidget.fedi(this.originalButton, `<small style="color: red">This doesn't appear to be an ActivityPub server.</small>`);
    }

    // Check if the application is supported
    if(this.application?.software?.name in this.endpointDetails === false) {
      // If the application type isn't supported, let's tell the user about it.
      return shareWidget.fedi(this.originalButton, `<small style="color: red">Unknown or unsupported service!</small>`);
    }
    
    // Now that we're here, we're pretty sure we have a usable hostname
    if("localStorage" in window && localStorage.setItem(this.localStorageKey, `${host.protocol}//${host.host}`));
    
    // Let's actually open the window now
    this.open(host, this.application.software.name);
  }

  /**
   * @param {URL} url 
   * @param {string} software 
   */
  open(url, software) {
    // Ensure `software` is actually a known and supported service
    if(software in this.endpointDetails == false) {
      return this.prompt(`<span color="red">"${software}" is not a supported Fediverse service.</span>`, "Ok", "Cancel", "bool");
    }
    
    // Handle s
    let description = this.description;
    let body = `${this.title}\n\n${description}\n\n${this.href}`;
    const charLen = this.endpointDetails[software].charLimit;
    if(charLen) {
      
      description = this.description.substr(0, charLen);

      const toSubtractFromDescription = this.title.length + this.href.length + 4;
      body = `${this.title}\n\n${description.substr(0, charLen - toSubtractFromDescription)}\n\n${this.href}`;
    }

    // Replace all instances of our placeholders with the appropriate details
    let endpoint = this.endpointDetails[software].endpoint
      .replaceAll("{body}", encodeURIComponent(body))
      .replaceAll("{title}", encodeURIComponent(this.title))
      .replaceAll("{description}", encodeURIComponent(description))
      .replaceAll("{url}", encodeURIComponent(this.href));

    // Establish our window options
    const options = [
      'toolbar=no',
      'location=no',
      'status=no',
      'menubar=no',
      `width=${this.endpointDetails[software].width ?? this.WIDTH}`,
      `height=${this.endpointDetails[software].height ?? this.HEIGHT}`
    ];
    
    // Open the popover window
    window.open(
      `${url.protocol}//${url.host}/${endpoint}`,
      'target',
      options.join(',')
    );
  }
}



class Modal {
  dialog = null;
  okay = null;
  cancel = null;
  resolve = null;
  constructor() {
    // Create our container
    this.dialog = document.createElement("dialog");
    this.dialog.classList.add("gh-share-dialog");
    document.body.appendChild(this.dialog);
    this.dialog.addEventListener("cancel", this.onCancel.bind(this));
  }

  /**
   * 
   * @param {string} title 
   * @param {string} type 
   * @returns 
   */
  prompt(title, type = "string", after = "", prefill = "") {
    // If the calling code hasn't specified buttons, let's do it here
    if(!this.cancel && !this.okay) this.buttons("Okay"); 
    return new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.body = document.createElement("div");
      this.body.innerHTML = title;

      // Build our input element
      switch(type) {
        case "bool":
          this.input = "";
          break;
        case "text":
        case "textarea":
          this.input = document.createElement("textarea");
          break;
        default:
          this.input = document.createElement("input");
          this.input.type = type;
          break;
      }
      
      if(this.input) {
        this.input.name = "input";
        this.input.classList.add("gh-prompt-input");
        this.input.value = prefill;
      }
      
      // We've been passed "after" text, let's handle that
      this.after = document.createElement("div");
      this.after.innerHTML = after;

      // Handle "okay" clicks
      this.okay.addEventListener("click", () => {
        if(!this.input.value) return;
        resolve(this.input.value);
        this.dialog.close();
      });

      // Let's build our dialog box
      this.dialog.appendChild(this.body);
      if(this.input) this.dialog.appendChild(this.input);
      this.dialog.appendChild(this.after);
      this.dialog.appendChild(this.buttonContainer);
      
      // Using `showModal()` so we get a styleable ::backdrop pseudoelement
      this.dialog.showModal();
    });
  }

  buttons(okay, cancel = "Cancel") {
    // Build our acknowledge button
    this.okay = document.createElement("button");
    this.okay.classList.add("gh-prompt-okay");
    this.okay.innerHTML = okay;

    // Create our cancel button if we've been passed a label
    if(cancel) {
      this.cancel = document.createElement("button");
      this.cancel.classList.add("gh-prompt-cancel");
      this.cancel.innerHTML = cancel;
      this.cancel.addEventListener("click", this.onCancel.bind(this));
    }

    // Add a button container and append our buttons to it
    this.buttonContainer = document.createElement("div");
    this.buttonContainer.classList.add("button-container");
    this.buttonContainer.appendChild(this.cancel);
    this.buttonContainer.appendChild(this.okay);
  }

  onCancel(resolve = (v) => {}) {
    // Remove the modal dialog from the DOm
    if(this.dialog.parentNode) this.dialog.parentNode.removeChild(this.dialog);
    // Resolve the promise
    this.resolve(false);
  }
}