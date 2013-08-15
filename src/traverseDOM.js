var frameHash = {};

function DOMElement(jQueryElement, domElement) {
		this.jQuery = jQueryElement;
		this.left = domElement.offsetLeft;
		this.top = domElement.offsetTop;
		this.tagName = domElement.tagName;
		cssElementList = ["width", "height", "margin-top", "margin-left", "margin-right", "margin-bottom", "padding-top", "padding-left", "padding-right" , "padding-bottom", "color", "background-color", "border-style", " border-color", "border-top", "border-left", "border-right", "border-bottom"];
		this.cssElements = new Array();
		for (var index = 1; index < cssElementList.length; index++) {
			this.cssElements.push(jQueryElement.css(cssElementList[index]));
		}
}

function getDOMHash() {
	traverseDOM($("body"), $("body").get(0));
	return frameHash;
}

function traverseDOM(jQueryElement, domElement) {
	var getText = jQueryElement.clone();
	getText.children().each(function(index, value) {
		traverseDOM($(this), domElement.children[index]);
		$(this).remove();
	});
	// temporary fix, now it only gets elements that have content inside!
	if (jQueryElement.text().replace(/\n|\t/gm, "") != "") {
		var hashIndex;	
		if ((id = domElement.attributes.getNamedItem("id")) != null) {
			hashIndex = id.nodeValue;
		} else {
			hashIndex = jQueryElement.prop("tagName") + "_" + domElement.offsetLeft + "_" + domElement.offsetTop;
		}
	}
	frameHash[hashIndex] = new DOMElement(getText, domElement);
}