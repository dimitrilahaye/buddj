export default class Numpad {
    // (A) PROPERTIES
    // (A1) HTML ELEMENTS
    hWrap = null;    // numpad wrapper container
    hDisplay = null; // number display
    now = null;     // current active instance

    // (B) INIT - CREATE NUMPAD HTML
    init() {
        // (B1) NUMPAD WRAPPER
        this.hWrap = document.createElement("div");
        this.hWrap.id = "numWrap";
        this.hWrap.innerHTML = `
                <div id="numPad">
                  <input type="text" id="numDisplay" value="0">
                  <div id="numBWrap"></div>
                </div>
            `;
        this.hWrap.addEventListener('click', (e) => {
            const isClickedOnPad = e.target.closest('#numPad');
            if (!isClickedOnPad) {
                this.hide();
            }
        });
        // this.hide();
        document.body.appendChild(this.hWrap);
        this.hDisplay = document.getElementById("numDisplay");

        // (B2) ATTACH BUTTONS
        let hbWrap = document.getElementById("numBWrap"),
            buttonator = (txt, css, fn) => {
                let button = document.createElement("div");
                button.innerHTML = txt;
                button.classList.add(...css);
                button.onclick = fn;
                hbWrap.appendChild(button);
            };
        for (let i = 7; i <= 9; i++) {
            buttonator(i, ["num", `num${i}`], () => this.digit(i));
        }
        buttonator("<i class=\"fa-solid fa-delete-left\"></i>", ["del"], () => this.delete());
        for (let i = 4; i <= 6; i++) {
            buttonator(i, ["num", `num${i}`], () => this.digit(i));
        }
        for (let i = 1; i <= 3; i++) {
            buttonator(i, ["num", `num${i}`], () => this.digit(i));
        }
        buttonator("<i class=\"fa-solid fa-rotate-left\"></i>", ["clr"], () => this.reset());
        buttonator(0, ["zero", "num0"], () => this.digit(0));
        buttonator(".", ["dot"], () => this.dot());
        buttonator("<i class=\"fa-solid fa-check\"></i>", ["ok", "valid"], () => this.select());
    }

    // (C) BUTTON ACTIONS
    // (C1) NUMBER (0 TO 9)
    digit(num) {
        // (C1-1) CURRENT VALUE
        let v = this.hDisplay.value;

        // (C1-2) WHOLE NUMBER (NO DECIMAL POINT)
        if (v.indexOf(".") === -1) {
            if (v.length < this.now.maxDig) {
                if (v === "0") {
                    this.hDisplay.value = num;
                } else {
                    this.hDisplay.value += num;
                }
            }
        }

        // (C1-3) DECIMAL POINT
        else {
            if (v.split(".")[1].length < this.now.maxDec) {
                this.hDisplay.value += num;
            }
        }
    }

    // (C2) ADD DECIMAL POINT
    dot() {
        if (this.hDisplay.value.indexOf(".") === -1) {
            if (this.hDisplay.value === "0") {
                this.hDisplay.value = "0.";
            } else {
                this.hDisplay.value += ".";
            }
        }
    }

    // (C3) BACKSPACE
    delete() {
        var length = this.hDisplay.value.length;
        if (length === 1) {
            this.hDisplay.value = 0;
        } else {
            this.hDisplay.value = this.hDisplay.value.substring(0, length - 1);
        }
    }

    // (C4) CLEAR ALL
    reset() {
        this.hDisplay.value = "0"
    }

    // (C5) OK - SET VALUE
    select() {
        let v = this.hDisplay.value;
        this.now.target.value = v;
        this.hide();
        if (this.now.onselect) {
            this.now.onselect(v);
        }
    }

    // (D) SHOW NUMPAD
    show(instance) {
        // (D1) SET CURRENT INSTANCE + DISPLAY VALUE
        this.now = instance;
        let cv = instance.target.value;
        if (cv === "" || isNaN(cv)) {
            cv = "0";
        }
        this.hDisplay.value = cv;

        // (D2) SET DECIMAL
        if (instance.maxDec === 0) {
            this.hWrap.classList.add("noDec");
        } else {
            this.hWrap.classList.remove("noDec")
        }

        // (D3) SHOW NUMPAD
        this.hWrap.classList.add("open");
    }

    // (E) HIDE/CLOSE NUMPAD
    hide(manual) {
        if (manual && this.now.oncancel) {
            this.now.oncancel();
        }
        this.hWrap.classList.remove("open");
    }

    // (F) ATTACH NUMPAD TO INPUT FIELD
    //  target: required, target field.
    //  maxDig: optional, maximum number of digits, default 10.
    //  maxDec: optional, maximum number of decimal places, default 2.
    //  onselect: optional, function to call after selecting number.
    //  oncancel: optional, function to call after canceling.
    attach(instance) {
        // (F1) DEFAULT OPTIONS
        if (instance.maxDig === undefined) {
            instance.maxDig = 10;
        }
        if (instance.maxDec === undefined) {
            instance.maxDec = 2;
        }

        // (F2) GET + SET TARGET OPTIONS
        instance.target.autocomplete = "off";
        instance.target.inputMode = "none"; // prevent onscreen keyboard
        instance.target.addEventListener("click", () => this.show(instance));
    }

}
