import * as CM from "./contextMenu.js";

// test code
//*
const clickTarget1 = document.querySelector("#target1");
const clickTarget2 = document.querySelector("#target2");

function isChildOfClass(htmlElement, className) {
    if (htmlElement != null) {
        let checker = (targetElement) => {
            let classes = targetElement.classList;
            if (classes != null) {
                for (let x = 0; x < classes.length && found == false; x += 1) {
                    if (className == classes[x]) {
                        return true;
                    }
                }
            }
            return false;
        }

        let currentTarget = htmlElement;
        let found = false;
        while (currentTarget != null && found == false) {
            found = checker(currentTarget);
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

// label
var labelStyle = {
    'padding': '20px 20px',
    'fontSize': '50px',
    'color': '#ff0000'
};
labelStyle = {};
const label1 = new CM.Label("label", labelStyle);

// button
var buttonStyle = {
    'padding': '20px 20px',
    'fontSize': '50px',
    'color': '#ff0000',
    'hoverBackground': '#0000ff'
};
buttonStyle = {};
const button1 = new CM.Button("cut", () => {
    contextMenuObj.remove();
}, buttonStyle);

// horizontal divider
var dividerStyle = {
    'borderColor': '#ff0000',
    'margin': '50px 0px',
    'padding': '0px 30px'
};
dividerStyle = {};
const horizontalDivider1 = new CM.HorizontalDivider(dividerStyle);

// root
var rootStyle = {
    'background': 'black',
    'borderRadius': '10px',
    'padding': '10px',
}
rootStyle = {};
const DefaultContextMenu = new CM.MenuPrefab(
    label1,
    horizontalDivider1,
    button1,
    new CM.Button("copy", () => {

        contextMenuObj.remove();
    }),    
    new CM.HorizontalDivider(),
    new CM.Button("paste", () => {

        contextMenuObj.remove();
    }),
    rootStyle
);

function bindEvents() {
    CM.bindContextMenuCreationToClickTarget(clickTarget1, DefaultContextMenu);
    CM.bindContextMenuCreationToClickTarget(clickTarget2, DefaultContextMenu);
    CM.bindWindowContextMenuEvents();
}

// execution
function testMainMethod() {
    bindEvents();
}

testMainMethod();

//*/