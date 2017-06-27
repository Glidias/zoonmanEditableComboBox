/* 
	ComboBox Object 
	http://www.zoonman.com/projects/combobox/

	Copyright (c) 2011, Tkachev Philipp
	All rights reserved.
	BSD License
	
	Modified by Glenn Ko, 2016
	- some fixes/improvements (flickering dropdown box closing/opening issues)
	- more options for varied use cases

    30/05/17 Shay Z. - Modified to adapt for use under Bootstrap environment.
    1. The "onclick" event handler is now assigned to the input object_name.
    2. The "span" ("pick") element is now optional.
    3. Dynamically set the height of the Dropdown list - based on the size of the input field.
    4. Handle the Escape key.
    5. On focus preserve the current field's value and restore it in case of Escape pressed.
    6. If Enter or Tab pressed - and the edit field does hold a valid value - select the first entry,
       which matches the input.
    7. Added the function: setList(), which allows modifying the contents of the Dropdown list:
    8. Added the function: setEditSelectEvent(), which registers an event for the event: 'list-item-select'.
       This event is triggered when clicking on an item in the Dropdown list and when the Edit field is blurred.
       The Event Hander can be optionally passed the object's constructor as a parameter - editSelectEventHandler
*/
ComboBox = function(object_name, editSelectEventHandler) {
    // Glenn: 
    this.showAll = false; // optional setting flag to show all entries rather than type-hint search
    this.unfocusOnSelect = false; //  optional setting flag to unfocus input when select
    var refocused = false;

    // Edit element cache 
    this.edit = document.getElementById(object_name);
    // Items Container 
    var ddl = document.getElementById(object_name).parentNode.getElementsByTagName('DIV');
    this.dropdownlist = ddl[0];
    // Current Item
    this.currentitem = null;
    // Current Item Index
    this.currentitemindex = null;
    // Visible Items Count
    this.visiblecount = 0;
    // 30/05/17 Shay Z. 5 - the Fields value on focust:
    this.valueOnFocus = null;
    // 30/05/17 Shay Z. 5 - The index of the first visible element; to be used when no specific value was chosen:
    this.firstVisibleIdx = -1;

    // Closure Object 
    var parobject = this;


    /**
     * 30/05/17 Shay Z. - 7. Modify the contents of the Dropdown list
     */
    this.setList = function(valsArr)
    {
        // Generate the new HTML text, which contains the contents of the input array:
        var newListHtml = '';
        valsArr.forEach(function(valElem) {
            newListHtml += '<a>' + valElem + '</a>';
        });

        // Assign it to the Drop down list:
        parobject.dropdownlist.innerHTML = newListHtml;
        parobject.setupListItems();
    };

    /**
     * 30/05/17 - Shay.Z - 8. Added an Event Handler on selection of an entry from the Drop down list:
     */
    this.setEditSelectEvent = function(evntHdlr)
    {
        parobject.edit.addEventListener('list-item-select', evntHdlr);
    };

    // 30/05/17 Shay Z. - 8. Set the optionl Event handler:
    if (editSelectEventHandler)
        this.setEditSelectEvent(editSelectEventHandler);
    

    /**
     * 30/05/17 - Shay.Z - Assign a value to the Edit field; this code was taken from the 
     * handler of the Enter key within the "keyup" event:
     */
    this.setEditValue = function()
    {
        var upv = '';
        if (parobject.visiblecount != 0) {
            if (parobject.currentitem)
            {
                    upv = parobject.currentitem.innerHTML;
            }
            else
            {
                if (parobject.firstVisibleIdx != -1)
                    upv = parobject.listitems[parobject.firstVisibleIdx].innerHTML 
            }

            upv = upv.replace(/\<b\>/ig, '');
            upv = upv.replace(/\<\/b\>/ig, '');
            parobject.edit.value = upv;
        }
        
    }


    // 30/05/17 Shay Z. - 1. Assign the Click handler of the input field:
    this.edit.onclick = function() {

        if (parobject.dropdownlist.style.display != "block") {
            parobject.edit.focus();
        }
    };
    // Picker
    var pick = document.getElementById(object_name).parentNode.getElementsByTagName('SPAN');
    // 30/05/17 Shay Z. - 2. The "Picker" element is optional:
    if (pick && pick.length > 0)
    {
        pick[0].onclick = this.edit.onclick;
    }

    // Show Items when edit get focus
    this.edit.onfocus = function() {
        // 30/05/17 Shay Z. - 3. Dynamically set the height of the Dropdown list -
        // based on the size of the input field. 
        // Get the # of elements in the selection list:
        var numListItems = parobject.listitems.length;
        if (numListItems > 0)
        {
            var st = getComputedStyle(parobject.listitems[0]);
            var editFieldHeight = st.lineHeight.replace(/px/g, '');
        }
        else
        {
            // Calculate the size of the Edit field:
            var st = getComputedStyle(parobject.edit);
            var editFieldHeight = st.lineHeight.replace(/px/g, '');
        }

        var dropDownHeight = editFieldHeight * ((numListItems < 15 ) ?  numListItems : 15);
        parobject.dropdownlist.style.height = dropDownHeight + 'px';

        // 30/05/17 Shay Z. 5 - Store the current value:
        valueOnFocus = parobject.edit.value;
        parobject.dropdownlist.style.display = 'block';
        refocused = false;
    };
    // Hide Items when edit lost focus
    this.edit.onblur = function() {
        // if (allowLoose && !refocused) {

            setTimeout(function() {
                parobject.dropdownlist.style.display = 'none';
                // 30/5/17 Shay Z. - 8. Fire the 'list-item-select' event:
                parobject.edit.dispatchEvent((new Event('list-item-select')));
             }, 150);
        // }
        refocused = false;
    };
    var allowLoose = true;
    // IE fix
    parobject.dropdownlist.onmousedown = function(event) {
        allowLoose = false;
        return false;
    }
    parobject.dropdownlist.onmouseup = function(event) {

            setTimeout(function() { allowLoose = true; }, 150);
            return false;
        }

    /**
     * 30/05/17 Shay Z - Setup the contents of the items of the Drop list:
     * This code was global and has been inserted into a function in order to support the
     * option to dynamically modify the list.
     */
    this.setupListItems = function()
    {
        parobject.listitems = parobject.dropdownlist.getElementsByTagName('A');
        for (var i = 0; i < parobject.listitems.length; i++) {
            var t = i;
            // Binding Click Event
            parobject.listitems[i].onclick = function() {
                    var upv = this.innerHTML;
                    upv = upv.replace(/\<b\>/ig, '');
                    upv = upv.replace(/\<\/b\>/ig, '');
                    parobject.edit.value = upv;
                    parobject.dropdownlist.style.display = 'none';
                    if (parobject.unfocusOnSelect) parobject.edit.blur();
                    else {
                        parobject.edit.focus();
                        refocused = true;
                    }
                    // 30/5/17 Shay Z. - 8. Fire the 'list-item-select' event:
                    parobject.edit.dispatchEvent((new Event('list-item-select')));
                    return false;
                }
                // Binding OnMouseOver Event
            parobject.listitems[i].onmouseover = function(e) {
                for (var i = 0; i < parobject.listitems.length; i++) {
                    if (this == parobject.listitems[i]) {
                        if (parobject.currentitem) {
                            parobject.currentitem.className = parobject.currentitem.className.replace(/light/g, '')
                        }
                        parobject.currentitem = parobject.listitems[i];
                        parobject.currentitemindex = i;
                        parobject.currentitem.className += ' light';
                    }
                }
            }
        }
    };
    // Get Items
    this.setupListItems();

    // Binding OnKeyDown Event
    this.edit.onkeydown = function(e) {
        e = e || window.event;
        // Move Selection Up
        if (e.keyCode == 38) {
            // up
            var cn = 0;
            if (parobject.visiblecount > 0) {
                if (parobject.visiblecount == 1) {
                    parobject.currentitemindex = parobject.listitems.length - 1;
                };
                do {
                    parobject.currentitemindex--;
                    cn++;
                }
                while (parobject.currentitemindex > 0 && parobject.listitems[parobject.currentitemindex].style.display == 'none');
                if (parobject.currentitemindex < 0) parobject.currentitemindex = parobject.listitems.length - 1;

                if (parobject.currentitem) {
                    parobject.currentitem.className = parobject.currentitem.className.replace(/light/g, '')
                };
                parobject.currentitem = parobject.listitems[parobject.currentitemindex];
                parobject.currentitem.className += ' light';
                parobject.currentitem.scrollIntoView(false);
            };
            e.cancelBubble = true;
            if (navigator.appName != 'Microsoft Internet Explorer') {
                e.preventDefault();
                e.stopPropagation();
            }
            return false;
        }
        // Move Selection Down
        else if (e.keyCode == 40) {
            //console.log("Down Key parobject.visiblecount: " + parobject.visiblecount );
            // down
            var ic = 0;
            if (parobject.visiblecount > 0) {
                do {
                    parobject.currentitemindex++;
                }
                while (parobject.currentitemindex < parobject.listitems.length && parobject.listitems[parobject.currentitemindex].style.display == 'none');
                if (parobject.currentitemindex >= parobject.listitems.length) parobject.currentitemindex = 0;

                if (parobject.currentitem) {
                    parobject.currentitem.className = parobject.currentitem.className.replace(/light/g, '')
                }
                parobject.currentitem = parobject.listitems[parobject.currentitemindex];
                parobject.currentitem.className += ' light';
                parobject.currentitem.scrollIntoView(false);
            }
            e.cancelBubble = true;
            if (navigator.appName != 'Microsoft Internet Explorer') {
                e.preventDefault();
                e.stopPropagation();
            }
            return false;
        } else if  (e.keyCode == 9) { // Set a value if Tab was pressed:
            parobject.setEditValue();
            parobject.dropdownlist.style.display = 'none';
            // e.cancelBubble = true;
            // if (navigator.appName != 'Microsoft Internet Explorer') {
            //     e.preventDefault();
            //     e.stopPropagation();
            // }
            // return false;            
        } else if (e.keyCode == 13) { // Glenn: if keycode enter found on dropdown lister, prevent event from propagating up to form (which can trigger submission)
            e.cancelBubble = true;
            if (navigator.appName != 'Microsoft Internet Explorer') {
                e.preventDefault();
                e.stopPropagation();
            }
            return false;
        }
    };
    this.edit.onkeyup = function(e) {
        e = e || window.event;
        //console.log("Up Key (e.keyCodeL" + e.keyCode + " + parobject.visiblecount: " + parobject.visiblecount );
        if (e.keyCode == 13 || e.keyCode == 27) {
            // 30/05/17 Shay Z. -
            // 6. If Enter or Tab pressed - and the edit foeld does hold a valid value - select the first entry,
            //which matches the input.       
            if (e.keyCode == 27) // Escape clicked
                parobject.edit.value = valueOnFocus;
            else // Enter  or Tab clicked
            {
                parobject.setEditValue();
            }
            parobject.dropdownlist.style.display = 'none';
            if (parobject.unfocusOnSelect) parobject.edit.blur();
            else {
                parobject.edit.focus();
                refocused = true;
            }

            e.cancelBubble = true;

            return false;
        } else {
            parobject.dropdownlist.style.display = 'block';
            parobject.visiblecount = 0;
            parobject.firstVisibleIdx = -1;
            if (parobject.edit.value == '') {
                for (var i = 0; i < parobject.listitems.length; i++) {
                    parobject.listitems[i].style.display = 'block';
                    parobject.visiblecount++;
                    var pv = parobject.listitems[i].innerHTML;
                    pv = pv.replace(/\<b\>/ig, '');
                    parobject.listitems[i].innerHTML = pv.replace(/\<\/b\>/ig, '');
                }
            } else {
                var re = new RegExp('(' + parobject.edit.value + ')', "i");

                var exactMatch = parobject.edit.value;
                for (var i = 0; i < parobject.listitems.length; i++) {
                    var pv = parobject.listitems[i].innerHTML;
                    pv = pv.replace(/\<b\>/ig, '');
                    pv = pv.replace(/\<\/b\>/ig, '');
                    if (parobject.showAll || re.test(pv)) { //true ||
                        parobject.listitems[i].style.display = 'block';
                        parobject.visiblecount++;
                        // 30/05/17 - Preserve the index of the first element, partially matching the input:
                        if (parobject.visiblecount == 1)
                           parobject.firstVisibleIdx = i;
                        parobject.listitems[i].innerHTML = pv.replace(re, '<b>$1</b>');
                    } else {
                        // do replacement as well in case later can be visible
                        parobject.listitems[i].innerHTML = pv.replace(re, '<b>$1</b>');
                        parobject.listitems[i].style.display = 'none';
                    }
                }

                // if visible count happens to be zero, show all elements
                if (parobject.visiblecount == 0) {

                    for (var i = 0; i < parobject.listitems.length; i++) {
                        parobject.listitems[i].style.display = 'block';
                    }
                }

            }
        }
    }

}
