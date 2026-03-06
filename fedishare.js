class Fedishare {

  props = {
    title: "",
    description: "",
    href: "",
    hashtags: [],
    message: ""
  }
  
  /** @property {Modal} modal */
  modal = null;
  originalButton = "";
  localStorageKey = "";
  localStorageRememberKey = "";

  /** @property {function} resolve */
  resolve = null;
  /** @property {function} reject */
  reject = null;
  /** @property {Promise} promise */
  promise = new Promise((resolve, reject) => {
    this.resolve = resolve;
    this.reject = reject;
  });

  WIDTH = 550;
  HEIGHT = 720;

  CAPABILITIES__SUPPORTS_PLAINTEXT = 0b00001;
  CAPABILITIES__SUPPORTS_MARKDOWN  = 0b00010;
  CAPABILITIES__SUPPORTS_HTML      = 0b00100;
  CAPABILITIES__SUPPORTS_HASHTAGS  = 0b01000;

  endpointDetails = {
    "calckey": {
      endpoint: "share?text={body}",
      charLimit: -1,
      width: null,
      height: null,
      capabilities: this.CAPABILITIES__SUPPORTS_PLAINTEXT + this.CAPABILITIES__SUPPORTS_MARKDOWN
    },
    "diaspora": {
      endpoint: "bookmarklet?title={title}&notes={description}&url={url}",
      charLimit: -1,
      width: null,
      height: null,
      capabilities: this.CAPABILITIES__SUPPORTS_PLAINTEXT + this.CAPABILITIES__SUPPORTS_MARKDOWN
    },
    "fedibird": {
      endpoint: "share?text={body}",
      charLimit: -1,
      width: null,
      height: null,
      capabilities: this.CAPABILITIES__SUPPORTS_PLAINTEXT + this.CAPABILITIES__SUPPORTS_MARKDOWN
    },
    "firefish": {
      endpoint: "share?text={body}",
      charLimit: -1,
      width: null,
      height: null,
      capabilities: this.CAPABILITIES__SUPPORTS_PLAINTEXT + this.CAPABILITIES__SUPPORTS_MARKDOWN
    },
    "foundkey": {
      endpoint: "share?text={body}",
      charLimit: -1,
      width: null,
      height: null,
      capabilities: this.CAPABILITIES__SUPPORTS_PLAINTEXT + this.CAPABILITIES__SUPPORTS_MARKDOWN
    },
    "friendica": {
      endpoint: "compose?title={title}&body={description}%0A{url}",
      charLimit: -1,
      width: null,
      height: null,
      capabilities: this.CAPABILITIES__SUPPORTS_PLAINTEXT + this.CAPABILITIES__SUPPORTS_MARKDOWN
    },
    "glitchcafe": {
      endpoint: "share?text={body}",
      charLimit: -1,
      width: null,
      height: null,
      capabilities: this.CAPABILITIES__SUPPORTS_PLAINTEXT + this.CAPABILITIES__SUPPORTS_MARKDOWN
    },
    "gnusocial": {
      endpoint: "notice/new?status_textarea={body}",
      charLimit: -1,
      width: null,
      height: null,
      capabilities: this.CAPABILITIES__SUPPORTS_PLAINTEXT + this.CAPABILITIES__SUPPORTS_MARKDOWN
    },
    "hometown": {
      endpoint: "share?text={body}",
      charLimit: -1,
      width: null,
      height: null,
      capabilities: this.CAPABILITIES__SUPPORTS_PLAINTEXT + this.CAPABILITIES__SUPPORTS_MARKDOWN
    },
    "hubzilla": {
      endpoint: "rpost?title={title}&body={description}%0A{url}",
      charLimit: -1,
      width: null,
      height: null,
      capabilities: this.CAPABILITIES__SUPPORTS_PLAINTEXT + this.CAPABILITIES__SUPPORTS_MARKDOWN
    },
    "kbin": {
      endpoint: "new/link?url={url}",
      charLimit: -1,
      width: null,
      height: null,
      capabilities: this.CAPABILITIES__SUPPORTS_PLAINTEXT + this.CAPABILITIES__SUPPORTS_MARKDOWN
    },
    "lemmy": {
      endpoint: "create_post?url={url}&title={title}&body={description}",
      charLimit: -1,
      width: null,
      height: null,
      capabilities: this.CAPABILITIES__SUPPORTS_PLAINTEXT + this.CAPABILITIES__SUPPORTS_MARKDOWN
    },
    "mastodon": {
      endpoint: "share?text={body}",
      charLimit: (nodeInfo) => {
        return 500;
      },
      maxLinkLength: 23, // What's the max length of a URL on this platform?
      width: null,
      height: null,
      capabilities: (nodeInfo) => {
        let capabilities = this.CAPABILITIES__SUPPORTS_PLAINTEXT + this.CAPABILITIES__SUPPORTS_HASHTAGS;
        if (nodeInfo.software.version.indexOf("glitch") >= 0) {
          capabilities += this.CAPABILITIES__SUPPORTS_MARKDOWN;
        }
        return capabilities;
      }
    },
    "meisskey": {
      endpoint: "share?text={body}",
      charLimit: -1,
      width: null,
      height: null,
      capabilities: this.CAPABILITIES__SUPPORTS_PLAINTEXT + this.CAPABILITIES__SUPPORTS_MARKDOWN
    },
    "microdotblog": {
      endpoint: "post?text=[{title}]({url})%0A%0A{description}",
      charLimit: -1,
      width: null,
      height: null,
      capabilities: this.CAPABILITIES__SUPPORTS_PLAINTEXT + this.CAPABILITIES__SUPPORTS_MARKDOWN
    },
    "misskey": {
      endpoint: "share?text={body}",
      charLimit: -1,
      width: null,
      height: null,
      capabilities: this.CAPABILITIES__SUPPORTS_PLAINTEXT + this.CAPABILITIES__SUPPORTS_MARKDOWN
    },
  };

  /**
   * 
   * @param {string} href 
   * @param {string} title 
   * @param {string} description 
   * @param {array} hashtags 
   */
  constructor(href, title, description, hashtags) {
    this.props.href = href;
    this.props.title = title;
    this.props.description = description;
    this.props.hashtags = hashtags;
  }

  get href() {
    return this.props.href;
  }
  get title() {
    return this.props.title;
  }
  get description() {
    let des = this.props.description.trim();
    if(des.indexOf("\n") >= 0) des = des.substring(0, des.indexOf("\n"));
    return des;
  }
  get hashtags() {
    return this.props.hashtags;
  }

  get button() {
    return this.originalButton;
  }
  
  set button(value) {
    this.originalButton = value;
  }

  get message() {
    return this.props.message;
  }

  set message(value) {
    this.props.message = value;
  }

  find(button, message) {
    this.button = button;
    this.message = message;
    // Get our service name
    const service = this.button?.dataset.shareService ?? "generic";

    // Define the key we'll use to restore our answer in localStorage
    this.localStorageKey = `gh-share-${service}`;
    this.localStorageRememberKey = `${this.localStorageKey}__remember`;

    // Let's prompt the user for their Fediverse details
    this.prompt(service, this.button);
    return this.promise;
  }

  async prompt(service, button) {
    // Check if the user has elected to *not display* the modal again.
    // if("localStorage" in window && localStorage.getItem(this.localStorageRememberKey)) {
    //   console.log("You chose to remember this instance...");
    //   return localStorage.getItem(this.localStorageKey);
    // }
    // Create our modal box
    this.modal = new ModalPrompt();
    this.modal.addEventListener("okay", event => {
      event.preventDefault();
      this.validateSubmission();
    });

    // Establish our friendly names and examples
    let serviceName = "Fediverse";
    let example = "https://mastodon.online";
    let icon = null;

    if (button) {
      icon = button.querySelector("svg")?.parentNode.innerHTML;
      // modal.dialog.style.backgroundColor = button.backgroundColor;
      // modal.dialog.style.color = button.color;
    }

    // Check for known services
    switch (service) {
      case "mastodon":
        serviceName = "Mastodon";
        example = "https://mastodon.social";
        break;
      case "lemmy":
        serviceName = "Lemmy";
        example = "https://lemmy.world";
        break;
    }

    // Restore our stored valued (if one exists)
    let value = "";
    if ("localStorage" in window && localStorage.getItem(this.localStorageKey)) {
      value = localStorage.getItem(this.localStorageKey);
    }

    // Display the message if we've been passed one
    if (!this.message) this.message = `<small style="color: rgb(from currentColor r g b / .5)">For example: ${example}</small>`;

    // Finally, let's wait for a prompt
    this.modal.prompt(`<div class="icon">${icon}</div><p>Domain name of your ${serviceName} server?</div>`, "string", {
      after: this.message,
      prefill: value
    });
    // const input = document.createElement("label");
    // input.innerHTML = "<input type='checkbox' name='remember'> Next time skip this dialog.<br>";
    // this.modal.input.parentNode.appendChild(input)

    return this.modal.promise;
  }

  async validateSubmission() {
    this.modal.working(true);
    let host = this.modal.input.value;
    if (!host) return;

    // Check if the user has provided us with just the hostname, prepend with "https" 
    if (typeof host == "string" && host.indexOf("http") !== 0) host = `https://${host}`;

    // Build a URL out of the user's response
    const url = new URL(host);
    const service = await this.discoverShareEndpoint(url);
    // If we've made it here, we have successfully
    this.modal.working(false);

    const save = this.modal.dialog.querySelector("[name='remember']");
    if(save && save.checked === true) {
      localStorage.setItem(this.localStorageRememberKey, true);
    }
    this.modal.deleteModal();
    return service;
  }

  /** 
   * @param {URL} host 
   * @returns {string|false} Returns a string version of the hostname or false is there was an error
   * */
  async discoverShareEndpoint(host) {
    try {
      // Fetch the nodeInfo from the user-supplied service
      this.nodeInfo = await fetch(`${host.protocol}//${host.host}/.well-known/nodeinfo`);
      this.nodeInfo = await this.nodeInfo.json();
      // Fetch the node software details
    } catch (error) {
      // If there was an error, let's tell the user about it.
      this.modal.message = `<span style="color: red">Something went wrong. Please try again.</span>`;
      this.modal.working(false);
      return false;
    }

    try {
      this.application = await fetch(this.nodeInfo.links[0].href);
      this.application = await this.application.json();
    } catch (error) {
      this.modal.message = `<span style="color: red">An unknown error occurred querying for nodeInfo</span>`;
      this.modal.working(false);
      return false;
    }

    // Check if this is actually a fediverse service
    if (!this.application?.software?.name) {
      this.modal.message = `<small style="color: red">This doesn't appear to be an ActivityPub server.</small>`;
      return false;
    }

    // Check if the application is supported
    if (this.application?.software?.name in this.endpointDetails === false) {
      // If the application type isn't supported, let's tell the user about it.
      this.modal.message = `<small style="color: red">Unknown or unsupported service!</small>`;
      return false;
    }

    // Now that we're here, we're pretty sure we have a usable hostname
    if ("localStorage" in window && localStorage.setItem(this.localStorageKey, `${host.protocol}//${host.host}`));

    // Let's actually open the window now
    this.open(host, this.application.software.name);
    return this.application.software.name;
  }

  /**
   * @param {URL} url 
   * @param {string} software 
   */
  open(url, software) {
    // Ensure `software` is actually a known and supported service
    if (software in this.endpointDetails == false) {
      return this.prompt(`<span color="red">"${software}" is not a supported Fediverse service.</span>`, "Ok", "Cancel", "bool");
    }

    // Handle s
    let description = this.description;
    let body = this.getTruncatedBody(software);


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

  getCharLimit(software) {
    const limit = this.endpointDetails[software].charLimit;
    if (!limit) return null;
    if (typeof limit === "function") return limit(software);
    return limit;
  }

  supportsMarkdown(software) {
    let capabilities = this.endpointDetails[software].capabilities;
    if(typeof capabilities == "function") capabilities = capabilities(this.application);
    return (capabilities & this.CAPABILITIES__SUPPORTS_MARKDOWN === this.CAPABILITIES__SUPPORTS_MARKDOWN);
  }

  getMinLinkLength(software, linkLength) {
    // return linkLength;
    const length = this.endpointDetails[software].maxLinkLength;
    if(!length) return linkLength;
    return Math.min(linkLength, length);
  }

  getTruncatedBody(software) {
    const max = this.getCharLimit(software);
    const hashtags = this.hashtags.join(" ");
    const description = this.description;
    const supportsMarkdown = this.supportsMarkdown(software);

    return getTruncatedBody({
      max,
      software,
      href: this.href,
      minLinkLength: this.getMinLinkLength(software, this.href.length),
      title: this.title,
      hashtags,
      description,
      supportsMarkdown,
      minSpareCharsForDescription: 40
    })
  }
}

function getTruncatedBody(options = {}) {
  let {max, href, minLinkLength, title, hashtags, description, minSpareCharsForDescription } = {
    max: 0,
    href: "",
    minLinkLength: options.href.length, // Some services don't count the full length of a string against a URL
    title: "",
    hashtags: "",
    description: "",
    supportsMarkdown: 0,
    minSpareCharsForDescription: 40,
    ...options
  };
  const newLine = "\n\n";
  const link = href;
  
  // Let's format our description
  if(supportsMarkdown) description = `> ${description}`;

  // If our max length is -1, we know we have an unlimited character length.
  if(max <= -1) {
    return `${title}${newLine}${description}${newLine}${hashtags}${newLine}${link}`;
  }

  let body = `${title}${newLine}${hashtags}${newLine}`;
  // Let's see what the minimum value is
  const min = body.length + minLinkLength;


  // If the title, hashtags, and URL are longer than the max length, we should 
  // truncate the title and omit the body.
  if(min > max) return `${title.substr(0,(max - min) - 5)}...\n\n${hashtags}\n\n${href}`;

  const diff = options.max - min;
    let ellipsis = "...";
  
  const endsWithPunctuation = /[^\w]$/;
  let truncated = description.substr(0, diff - 7).trim();
  
  // Detect non-word character at the end of the truncated string
  if(endsWithPunctuation.test(truncated)) {
    ellipsis = "";
  }
  // If the difference between the max and min is greater 50 characters, then
  // it's worth it for us to include a truncated description. So let's do that.
  if(diff > minSpareCharsForDescription) return `${title}\n\n${truncated}${ellipsis}\n\n${hashtags}\n\n${href}`;
  
  // Otherwise, let's just append the link to the description
  return body + link;
}

/**
 * @emits {okay} preventDefault() to prevent the okay event from closing the modal and resolving the promise
 * @emits {cancel} preventDefault() to prevent the cancel event from closing the modal and resolving the promise to false
 */
class ModalPrompt extends EventTarget {
  /** @property {HTMLDialogElement} */
  dialog = null;
  /** @property {HTMLDivElement} */
  body = null;
  /** @property {HTMLDivElement} */
  after = null;

  /** @property {HTMLButtonElement} */
  okay = null;
  /** @property {HTMLButtonElement|null} */
  cancel = null;

  /** @property {Promise} promise the promise that will be resolved */
  promise = null;
  /** @property {function} resolve this.promise resolver */
  resolve = null;

  constructor() {
    super();
    // Create our container
    this.dialog = document.createElement("dialog");
    this.dialog.classList.add("gh-share-dialog");
    document.body.appendChild(this.dialog);
    this.dialog.addEventListener("cancel", this.onCancel.bind(this));
  }

  /** @property {string} message the innerHTML of the `after` element */
  get message() {
    return this.after.innerHTML;
  }

  /** @param {string} string a string of valid HTML */
  set message(string) {
    this.after.innerHTML = string;
  }

  /** @property {HTMLDivElement} spinner a loading spinner */
  spinner = null;

  working(status) {
    if(!this.spinner) {
      this.spinner = document.createElement("div");
      this.spinner.classList.add("modal--loading-spinner");
      this.spinner.innerHTML = `
        <style>
          .modal--loading-spinner {
            position: absolute;
            inset: 0;
            background-color: rgb(0 0 0 / .5);
            display: grid;
            place-content: center;
          }
          .modal--loading-spinner:before {
            content: "";
            width: 48px;
            height: 48px;
            border: 5px solid #FFF;
            border-bottom-color: transparent;
            border-radius: 50%;
            display: inline-block;
            box-sizing: border-box;
            animation: rotation 1s linear infinite;
          }
          @keyframes rotation {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          } 
        </style>
      `;
    }
    switch(status) {
      case true:
      case "true":
      case "working":
        this.body.appendChild(this.spinner);
        break;
      default:
        this.spinner.parentNode.removeChild(this.spinner);
        break;
    }
  }

  /**
   * 
   * @param {string} title 
   * @param {string} type 
   * @returns {Promise}
   */
  prompt(title, type = "string", options = {}) {
    // Define our options
    options = {
      after: "",
      prefill: "",
      deleteModalAfterResolve: true,
      /**
       * @param {*} value 
       * @param {Modal} modal `this`
       * @returns {bool} `true` if valid, `false` if invalid
       */
      inputFilter: (value, modal) => {
        // By default, we want to ensure *some* value was submitted
        if (!value) return false;
        return true;
      },
      ...options,
    }
    // If the calling code hasn't specified buttons, let's do it here
    if (!this.cancel && !this.okay) this.buttons("Okay");
    this.deleteModalAfterResolve = options.deleteModalAfterResolve;
    this.promise = new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.body = document.createElement("div");
      this.body.innerHTML = title;

      // Build our input element
      switch (type) {
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

      if (this.input) {
        this.input.name = "input";
        this.input.classList.add("gh-prompt-input");
        this.input.value = options.prefill;
      }

      // We've been passed "after" text, let's handle that
      this.after = document.createElement("div");
      this.after.innerHTML = options.after;

      // Handle "okay" clicks
      this.okay.addEventListener("click", () => {
        const event = this.dispatchEvent(new CustomEvent("okay", {cancelable: true}));
        if(!event) return;
        if (this.type == "bool") {
          // If we're a `bool` type, we should return `true` since we 
          // clicked the `okay` button
          resolve(true);
          this.dialog.close();
          return;
        }
        // Filter our inputs
        if (options.inputFilter(this.input.value, this) === false) return;
        resolve(this.input.value);
        this.dialog.close();
      });

      // Let's build our dialog box
      this.dialog.appendChild(this.body);
      if (this.input) this.dialog.appendChild(this.input);
      this.dialog.appendChild(this.after);
      this.dialog.appendChild(this.buttonContainer);

      // Using `showModal()` so we get a styleable ::backdrop pseudoelement
      this.dialog.showModal();
    });
    return this.promise;
  }

  buttons(okay, cancel = "Cancel") {
    // Build our acknowledge button
    this.okay = document.createElement("button");
    this.okay.classList.add("gh-prompt-okay");
    this.okay.innerHTML = okay;

    // Create our cancel button if we've been passed a label
    if (cancel) {
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

  onCancel(resolve = (v) => { }) {
    const result = this.dispatchEvent(new CustomEvent("cancel", {cancelable: true}));
    if(!result) return;
    // Resolve the promise
    this.resolve(false);
    if (this.deleteModalAfterResolve) {
      this.deleteModal();
    }
  }

  deleteModal() {
    // Remove the modal dialog from the DOM
    if (this.dialog.parentNode) this.dialog.parentNode.removeChild(this.dialog);
  }
}