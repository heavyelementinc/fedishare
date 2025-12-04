export default class Modal {
  dialog = null;
  okay = null;
  cancel = null;
  resolve = null;
  constructor() {
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
    if(!this.cancel && !this.okay) this.buttons();
    return new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.body = document.createElement("div");
      this.body.innerHTML = title;

      switch(type) {
        case "bool":
          this.input = "";
          break;
        case "text":
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
      this.after = document.createElement("div");
      this.after.innerHTML = after;
      this.okay.addEventListener("click", () => {
        if(!this.input.value) return;
        resolve(this.input.value);
        this.dialog.close();
      });
      this.dialog.appendChild(this.body);
      if(this.input) this.dialog.appendChild(this.input);
      this.dialog.appendChild(this.after);
      this.dialog.appendChild(this.buttonContainer);
      this.dialog.showModal();
    });
  }

  buttons(okay = "Okay", cancel = "Cancel") {
    this.okay = document.createElement("button");
    this.okay.classList.add("gh-prompt-okay");
    this.okay.innerHTML = okay;

    if(cancel) {
      this.cancel = document.createElement("button");
      this.cancel.classList.add("gh-prompt-cancel");
      this.cancel.innerHTML = cancel;
    }

    if(cancel) this.cancel.addEventListener("click", this.onCancel.bind(this));
    this.buttonContainer = document.createElement("div");
    this.buttonContainer.classList.add("button-container");
    this.buttonContainer.appendChild(this.cancel);
    this.buttonContainer.appendChild(this.okay);
    // this.confirm();
  }

  onCancel(resolve = (v) => {}) {
    if(this.dialog.parentNode) this.dialog.parentNode.removeChild(this.dialog);
    this.resolve(false);
  }
}