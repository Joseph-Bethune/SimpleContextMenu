//#region type checks

/*
    returns true if the value is a json object or else returns false
//*/
function isJsonObject(value) {
    if (value === null) {
        return false;
    }
    else {
        if (value.constructor === Object) {
            return true;
        }
        else {
            return false;
        }
    }
}

/*
    returns true if the value is an array or else returns false
//*/
function isArrayObject(value) {
    if (value === null) {
        return false;
    }
    else {
        if (value.constructor === ([]).constructor) {
            return true;
        }
        else {
            return false;
        }
    }
}

//#endregion

//#region context menu objects

// contains no members
// used as a common base class for all context menu items
class ObjectBase_Abstract {
    _currentStyle

    //#region styling

    validateStyle(inputStyle) {
        let defaultStyle = this.constructor.getDefaultStyle();

        if (isJsonObject(inputStyle)) {
            return this._validateStyle_SkipTypeCheck(inputStyle, defaultStyle);
        }

        return defaultStyle;
    }

    _validateStyle_SkipTypeCheck(inputStyle, defaultStyle) {
        let output = defaultStyle;
        let keys = Object.keys(output);

        keys.forEach((currentKey, index) => {
            let currentVal = inputStyle[currentKey];
            if (currentVal != undefined) {
                output[currentKey] = currentVal;
            }
        });

        return output;
    }

    getStyle() {
        return this._currentStyle;
    }

    setStyle(newStyle) {
        this._currentStyle = this.validateStyle(newStyle);
    }

    //#endregion
}

class MenuItemBase_Abstract extends ObjectBase_Abstract {

}

// horizontal line that stretches across the context menu
class HorizontalDivider extends MenuItemBase_Abstract {
    constructor(newStyle = null) {
        super();
        if (newStyle === null) {
            this._currentStyle = HorizontalDivider.getDefaultStyle();
        }
        else {
            this.setStyle(newStyle);
        }
    }

    //#region styling    

    static getDefaultStyle() {
        return {
            "borderColor": "#eee",
            'padding': 0,
            'margin': 0
        };
    }

    static getStyleKeys() {
        return Object.keys(HorizontalDivider.getDefaultStyle());
    }

    //#endregion
}

// text item
class Label extends MenuItemBase_Abstract {
    #text

    constructor(text, newStyle = null) {
        super();
        this.#text = text;
        if (newStyle == null) {
            this.setStyle(Label.getDefaultStyle());
        }
        else {
            this.setStyle(newStyle);
        }
    }

    getText() {
        return this.#text;
    }

    //#region styling       

    static getDefaultStyle() {
        return {
            'margin': '5px',
            'padding': "8px 10px",
            'fontSize': "15px",
            'color': "#eee",
        };
    }

    static getStyleKeys() {
        return Object.keys(Label.getDefaultStyle());
    }

    //#endregion
}

// clickable button with a text label
// stores an event to be executed when this button is clicked
class Button extends Label {
    #clickEvent
    constructor(text, clickEvent, newStyle = null) {
        super(text, newStyle);
        this.#clickEvent = (contextMenu, contextMenuButton) => {

            clickEvent(contextMenu, contextMenuButton);
        };
    }

    getClickEvent() {
        return this.#clickEvent;
    }

    //#region styling

    static getDefaultStyle() {
        let superStyle = Label.getDefaultStyle();
        let currentStyle = {
            'hoverBackground': '#555'
        }
        return { ...superStyle, ...currentStyle };
    }

    static getStyleKeys() {
        return Object.keys(Button.getDefaultStyle());
    }

    //#endregion
}

class MenuPrefab extends ObjectBase_Abstract {
    #activeContextMenu

    constructor(...menuItems) {
        super();
        if (menuItems != null && menuItems.length > 0) {
            let styleObject = menuItems[menuItems.length - 1];
            if (isJsonObject(styleObject)) {
                this._currentStyle = this._validateStyle_SkipTypeCheck(styleObject, MenuPrefab.getDefaultStyle());
                this.menuItems = menuItems.slice(0, -1);
            }
            else {
                this._currentStyle = MenuPrefab.getDefaultStyle();

                this.menuItems = menuItems;
            }
        }
    }

    //#region styling

    static getDefaultStyle() {
        return {
            "fontFamily": "sans-serif",
            "background": '#1b1a1a',
            'borderRadius': '10px',
            'padding': 0,
            'boxShadow': "5px 5px 10px rgba(0, 0, 0, 0.5)",
        };
    }

    static getStyleKeys() {
        return Object.keys(MenuPrefab.getDefaultStyle());
    }

    //#endregion

    #constructContextMenu(event, menuItems) {
        let root = document.createElement("div");
        document.querySelector("body").appendChild(root);
        root.id = "context-menu";

        //
        root.style.margin = this._currentStyle['margin'];
        root.style.fontFamily = this._currentStyle['fontFamily'];
        root.style.background = this._currentStyle['background'];
        root.style.borderRadius = this._currentStyle['borderRadius'];
        root.style.padding = this._currentStyle['padding'];
        root.style.boxShadow = this._currentStyle['boxShadow'];

        //
        root.style.margin = 0;
        root.style.left = event.clientX + "px";
        root.style.top = event.clientY + "px";
        root.style.position = "fixed";
        root.style.zIndex = "10000";
        root.style.width = "fit-content";
        root.style.transformOrigin = 'top left';

        for (const ele of menuItems) {

            if (ele instanceof Label) {
                let button = document.createElement("div");

                //
                button.style.padding = ele._currentStyle['padding'];
                button.style.fontSize = ele._currentStyle['fontSize'];;
                button.style.color = ele._currentStyle['color'];
                button.style.margin = ele._currentStyle['margin'];

                //
                button.innerText = ele.getText();
                button.style.width = "fit-content";

                if (ele instanceof Button) {
                    button.addEventListener("mouseenter", () => {
                        button.style.background = ele._currentStyle['hoverBackground'];
                    });

                    button.addEventListener("mouseleave", () => {
                        button.style.background = "transparent";
                    });

                    button.addEventListener("click", () => {
                        ele.getClickEvent()(root, button);
                    });
                }

                root.appendChild(button);
            }
            else if (ele instanceof HorizontalDivider) {
                let divider = document.createElement("hr");

                //
                divider.style.borderColor = ele._currentStyle['borderColor'];
                divider.style.margin = ele._currentStyle['margin'];
                divider.style.padding = ele._currentStyle['padding'];

                root.appendChild(divider);
            }
        }

        const rect = root.getBoundingClientRect();
        const overLappingX = !(rect.right <= (window.innerWidth || document.documentElement.clientWidth));
        const overLappingY = !(rect.bottom <= (window.innerHeight || document.documentElement.clientHeight));

        if (overLappingX) {
            root.style.left = (event.clientX - rect.width) + "px";
        }

        if (overLappingY) {
            root.style.top = (event.clientY - rect.height) + "px";
        }

        // context scales up from zero
        root.style.transform = "scale(0)";
        setTimeout(() => {
            root.style.transform = "scale(1)";
            root.style.transition = "transform 100ms ease-in-out";
        }, 0);

        this.#activeContextMenu = root;
        return root;
    }

    construct(event) {
        return this.#constructContextMenu(event, this.menuItems);
    }

    getActiveContextMenu() {
        return this.#activeContextMenu;
    }
}

//#endregion

//#region context menu registry

/*
Used to keep track of which context menu should be created when a dom object is right clicked.
//*/
class ContextMenuRegistry {
    #registry
    #nullKeyCounter;
    constructor() {
        this.#registry = new Map();
    }

    bindNewHandler(domObject, contextMenuPrefab) {
        if (domObject && contextMenuPrefab) {
            this.#registry.set(domObject, contextMenuPrefab);
        }
    }

    clearHandler(domObject) {
        if (domObject && this.#registry.has(domObject)) {
            this.#registry.delete(domObject);
        }
    }

    findParentInRegistry(domObject) {
        return getAncestorElementFromLineup(
            domObject,
            ...this.#registry.keys());
    }

    getBoundContextMenu(domObject) {
        if (domObject) {

            let key = this.findParentInRegistry(domObject);

            let output = this.#registry.get(key);

            return (output != undefined) ? output : null;
        }
        return null;
    }
}

const EventHandlerRegistry = new ContextMenuRegistry();

//#endregion

//#region additional utility methods

/*
Returns true if the child html element is a descendent of the parent html element or else returns false.
If the optional "includeSelf" flag is set to true, then the parent and child can be the same object.
//*/
function isDescendedFromElement(childElement, parentElement, includeSelf = true) {

    if (childElement != null) {

        let currentTarget = includeSelf ? childElement : childElement.parentNode;
        let found = false;
        while (currentTarget != null && found == false) {
            found = (parentElement == currentTarget);
            if (!found) {
                let parent = currentTarget.parentNode;

                currentTarget = parent;
            }
        }

        if (found) {
            return true;
        }
    }

    return false;
}

/*
Returns the first element from the potential ancestors array that the child element is descended from.
Returns null if no applicable target could be found.
//*/
function getAncestorElementFromLineup(childElement, ...potentialAncestors) {
   
    if (childElement && potentialAncestors && potentialAncestors.length > 0) {
        
        for (let x = 0; x < potentialAncestors.length; x += 1) {
            
            if (isDescendedFromElement(childElement, potentialAncestors[x], true)) {
                
                return potentialAncestors[x];
            }
        }
    }
    
    return null;
}

//#endregion

//#region event methods

/*
Destroys all context menus.
//*/
function destroyContextMenuEventResponse() {
    var contextElement = document.querySelector("#context-menu");

    if (contextElement) {
        contextElement.remove();
    }
}

/*
Binds custom context menu creatoin events to the window.
Must be executed at least once after the page loads.
//*/
function bindWindowContextMenuEvents() {

    window.addEventListener("click", destroyContextMenuEventResponse);

    window.addEventListener("contextmenu", (event) => {
        destroyContextMenuEventResponse();
        let contextMenuPrefab = EventHandlerRegistry.getBoundContextMenu(event.target);
        if (contextMenuPrefab != null) {
            event.preventDefault();
            contextMenuPrefab.construct(event);
        }
    });
}

/*
Causes the given context menu prefab to be constructed if the user right clicks on the "click target"...
    or one of its descendents.
Only one menu prefab can be bound to a click target at time.
    If the click target already has a context menu prefab assigned, this will replace it.
The same menu prefabe can be bound to multiple click targets.
//*/
function bindContextMenuCreationToClickTarget(clickTarget, contextMenuPrefab) {
    EventHandlerRegistry.bindNewHandler(clickTarget, contextMenuPrefab);
}

/*
Removes context menu binding from click target.
//*/
function unbindContextMenuCreationFromClickTarget(clickTarget){
    EventHandlerRegistry.clearHandler(clickTarget);
}

//#endregion

//#region export section

export {
    ObjectBase_Abstract,
    MenuItemBase_Abstract,
    HorizontalDivider,
    Label,
    Button,
    MenuPrefab,
    destroyContextMenuEventResponse,
    bindContextMenuCreationToClickTarget,
    unbindContextMenuCreationFromClickTarget,
    bindWindowContextMenuEvents,    
}

//#endregion
