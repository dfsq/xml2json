var XMLParser = (function() {
	
	/** *********************************************************************
	 * @param xmlStr
	 * @returns {String}
	 */
	function parse(xmlStr) {
		
		var parser = new DOMParser(),
			doc = parser.parseFromString(xmlStr, "application/xml"),
			err;
		
		return process((err = doc.getElementsByTagName('parsererror')).length ? err : doc.childNodes);
	}
	
	function process(nodes, level) {
		
		var parsed = '',
			i = 0, l = nodes.length;
		
		level = level || 0;
		
		for (; i < l; i++) {
			
			if (nodes[i].nodeType != 1) continue;
			
			parsed += openTag(nodes[i], level);
			
			if (nodes[i].childElementCount) {
				parsed += process(nodes[i].childNodes, level + 1);
				parsed += closeTag(nodes[i], level);
			}
		}
		
		return parsed;
	}
	
	function openTag(node, level) {
		
	    var span = '<div>',
	    	cls  = node.nodeName + '-' + level;

	    span += (new Array(level * 4 + 1).join('&nbsp;')) + 
			    '<span class="tag tag-open ' + cls + '" data-tag="' + cls + '">&lt;' + 
			    node.nodeName + getAttrs(node) + 
			    (hasContent(node) ? '<span class="tag ' + cls + '" data-tag="' + cls + '">&gt;</span>' : '') + '</span>';
		
		if (node.childElementCount) span += '\n';
		else {
			if (node.firstChild) span += node.firstChild.nodeValue;
			span += '<span class="tag ' + cls + '" data-tag="' + cls + '">&lt;/' + node.nodeName + '&gt;</span>';
		}
		
	    return span + '</div>';
	}
	
	function getAttrs(node) {
	    
	    var attrStr = '',
	        attrs = node.attributes,
	        l = attrs.length;
	    
	    for (var i = 0; i < l; i++) {
	        attrStr += ' ' + '<span class="atn">' + attrs[i].nodeName + '</span>' +
				'<span class="pun">' + '=</span><span class="atv">"' + attrs[i].nodeValue + '"</span>';
	    }
		
	    return attrStr ? '</span>' + attrStr : '';
	}
	
	function closeTag(node, level) {

	    var span = '<div>',
	    	cls  = node.nodeName + '-' + level;

		if (node.childElementCount) {
			span += (new Array(level * 4 + 1).join('&nbsp;'));
		}
		if (hasContent(node)) {
			span += '<span class="tag ' + cls + '" data-tag="' + cls + '">&lt;/' + node.nodeName + '&gt;</span>\n';
		}
		else span += '<span class="tag ' + cls + '" data-tag="' + cls + '">/&gt;</span>\n';
		return span + '</div>';
	}
	
	function hasContent(node) {
		return !!node.childNodes.length;
	}

	function toJSON(xmlString, tag, attributes, inline) {
		
		var xml = (new DOMParser()).parseFromString(xmlString, "application/xml"),
			nsRes = (function(element) {
					var nsResolver = element.ownerDocument.createNSResolver(element),
						defaultNamespace = element.getAttribute('xmlns');
					return function(prefix) {
						return nsResolver.lookupNamespaceURI(prefix) || defaultNamespace;
					};
			})(xml.documentElement),
			nsPrefix = xml.documentElement.getAttribute('xmlns') ? 'default:' : '',
			xpath = (new Array(+tag[1] + 1).join('/*')) + '/' + nsPrefix + tag[0],
			nodes = xml.evaluate(xpath, xml, nsRes, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null),
			node  = nodes.iterateNext();
		
		inline = typeof inline === 'undefined' ? false : !!inline;
		return xml2json(node, inline ? "" : "    ", attributes);
	}
	
	return {
		parse: parse,
		toJSON: toJSON
	}
	
})();