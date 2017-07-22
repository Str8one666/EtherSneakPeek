// Ether Sneak Peek: Instantly see the balance of an 
// Ethereum address mentioned on any web page.
// Extension available on the store at https://chrome.google.com/webstore/detail/bitcoin-sneak-peek/nmoioahfkdpfpjngcljhcphglbdppdmj
//
// Copyright (c) 2017 Steven Van Vaerenbergh
//
// URL: https://github.com/steven2358/EtherSneakPeek
//
// Licensed under the MIT license:
//http://www.opensource.org/licenses/mit-license.php

(function() {
  /*
  * Walk through the DOM tree and process all text nodes.
  * From http://stackoverflow.com/a/5904945/1221212
  */
  function walk(node) {
    
    var child, next;
    try {
      switch (node.nodeType) {
      case 1:  // Element
      case 9:  // Document
      case 11: // Document fragment
        child = node.firstChild;
        while (child) {
          next = child.nextSibling;
          walk(child);
          child = next;
        }
        break;
      case 3: // Text node
        if(node.parentElement.tagName.toLowerCase() != "script") {
          processTextNode(node);
        }
        break;
      }
    }
    catch (err) {
      console.log("Error EtherSneakPeek: " + err);
    }
  }

  /*
  * Check if DOM text node is a link.
  * From http://stackoverflow.com/a/5540610
  */
  function nodeInLink(textNode) {
    var curNode = textNode;
    while (curNode) {
      if (curNode.tagName == 'A')
      return true;
      else
      curNode = curNode.parentNode;
    }
    return false;
  }

  function nodeInSpan(textNode) {
    var curNode = textNode;
    while (curNode) {
      if (curNode.tagName == 'SPAN')
      return true;
      else
      curNode = curNode.parentNode;
    }
    return false;
  }

  /*
  * Apply an addEventListener to each element of a node list.
  * From http://stackoverflow.com/a/12362466
  */
  function addEventListenerByClass(className, event, fn) {
    var list = document.getElementsByClassName(className);
    for (var i = 0, len = list.length; i < len; i++) {
      list[i].addEventListener(event, fn, false);
    }
  }

  /*
  * Insert a span inside a text node.
  * From http://stackoverflow.com/a/374187
  */
  function insertSpanInTextNode(textNode,spanKey,spanClass,at) {
    // create new span node
    var span = document.createElement("span");
    span.setAttribute('key',spanKey);
    span.className = spanClass;
    span.appendChild(document.createTextNode(''));

    // split the text node into two and add new span
    textNode.parentNode.insertBefore(span, textNode.splitText(at));
  }

  /*
  * Insert a span inside after the parent node that represents a link.
  */
  function insertSpanAfterLink(textNode,spanKey,spanClass) {
    var curNode = textNode;
    while (curNode) {
      if (curNode.tagName == 'A') {
        // create new span node
        var span = document.createElement("span");
        span.setAttribute('key',spanKey);
        span.className = spanClass;
        span.appendChild(document.createTextNode(''));
        
        // add the span after the link
        curNode.parentNode.insertBefore(span,curNode.nextSibling);
        return true;
      }
      else {
        curNode = curNode.parentNode;
      }
    }
  }

  /*
  * Insert a span inside after the parent node that represents a span.
  */
  function insertSpanAfterSpan(textNode,spanKey,spanClass) {
    var curNode = textNode;
    while (curNode) {
      if (curNode.tagName == 'SPAN') {
        // create new span node
        var span = document.createElement("span");
        span.setAttribute('key',spanKey);
        span.className = spanClass;
        span.appendChild(document.createTextNode(''));
        
        // add the span after the link
        curNode.parentNode.insertBefore(span,curNode.nextSibling);
        return true;
      }
      else {
        curNode = curNode.parentNode;
      }
    }
  }

  /*
  * Load data from etherscan.io and write to span.
  */
  function loadData(node,publicKey) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4) {
        var status = xhr.status;
        if (status == 200) {
          var myBalance = parseInt(xhr.response.result)/1000000000/1000000000;
          node.innerHTML = ' [Balance: '+ myBalance + ' ETH. <a href="https://etherscan.io/address/'+ publicKey +'" target="_blank">Etherscan</a>]';
        } else {
          node.innerHTML = ' [<a href="https://etherscan.io/address/'+ publicKey +'" target="_blank">Etherscan</a> info not available.]';
          console.log('Etherscan info not available. Error '+status+'.');
          loadEtherChainData(node,publicKey);
        }
      }
    }
    var url = 'https://api.etherscan.io/api?module=account&action=balance&address='+publicKey+'&tag=latest'
    node.innerHTML = ' Loading...';
    
    xhr.open("GET", url, true);
    xhr.responseType = 'json';
    xhr.send();
  }

  /*
  * Load data from etherchain.org.
  */
  function loadEtherChainData(node,publicKey) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4) {
        var status = xhr.status;
        if (status == 200) {
          json = JSON.parse(xhr.response);
          var myBalance = json['data'][0]['balance']/1000000000/1000000000;
          loadEtherChainReceived(node,publicKey,myBalance);
        } else {
          node.innerHTML = ' [<a href="https://etherchain.org/account/'+ publicKey +'" target="_blank">etherchain</a> not available.]';
          console.log('etherchain not available. Error '+status+'.');
        }
      }
    }
    var url = 'https://etherchain.org/api/account/'+publicKey;
    
    xhr.open("GET", url, true);
    xhr.send();
  }

  /*
  * Load received amount from etherchain.org and write to span.
  */
  function loadEtherChainReceived(node,publicKey,myBalance) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4) {
        var status = xhr.status;
        if (status == 200) {
          var myReceived = xhr.response;
          node.innerHTML = ' [Balance: '+ myBalance + ' ETH. <a href="https://etherchain.org/account/'+ publicKey +'" target="_blank">etherchain</a>]';
        } else {
          node.innerHTML = '[ <a href="https://etherchain.org/account/'+ publicKey +'" target="_blank">etherchain</a> not available.]';
          console.log('etherchain not available. Error '+status+'.');
        }
      }
    }
    var url = 'https://etherchain.org/api/account/'+publicKey;
    
    xhr.open("GET", url, true);
    xhr.send();
  }

  /*
  * Action to perform when clicking on icon.
  */
  function ebToggle(){
    if (this.nextSibling.innerHTML == ''){
      this.nextSibling.style.display = 'inline';
      var publicKey = this.parentNode.getAttribute('key');
      loadData(this.nextSibling,publicKey);
    }
    else {
      if (this.nextSibling.style.display == 'none') {
        this.nextSibling.style.display = 'inline';
      } else {
        this.nextSibling.style.display = 'none';
      }
    }
  }

  /*
  * Add an image and an empty span to ebHolder span.
  */
  function addHolderContent(context) {
    try {
      var list = context.getElementsByClassName('ebHolder');

      for (var i = 0, len = list.length; i < len; i++) {
        var img = document.createElement("img");
        img.src = chrome.extension.getURL("i/ethersneakpeek_logo32.png");
        img.className = 'etherBalanceIcon';
        img.setAttribute('title','Ether Sneak Peek');
        img.setAttribute('alt',''); // avoid copying out extension text
        img.style.cssText = 'height:1em;vertical-align:-10%;cursor:pointer;margin-left:.5em;display:inline;margin-top:0;margin-bottom:0;';
        list[i].appendChild(img);
        
        var span = document.createElement("span");
        span.style.cssText = 'display:none';
        span.appendChild(document.createTextNode(''));
        list[i].appendChild(span);
      }

    }
    catch (err) {
      console.log("Error EtherSneakPeek: " + err);
      return false;
    }
  }

  /*
  * Add code to DOM nodes.
  */
  function processTextNode(textNode) 
  {
    /*
    * Case 1: no address in text -> do nothing
    * Case 2: one or more addresses in text, not part of link -> place span after each address
    * Case 3: one address in text, part of link -> place span after link node
    */
    
    var re = /\b0x[a-zA-Z0-9]{40}\b/g;
    var val = textNode.nodeValue;
    
    if (re.test(val)) { // exclude case 1
      if (nodeInLink(textNode)) { // case 3
        var publicKeys = val.match(re);
        var publicKey = publicKeys[0];
        
        insertSpanAfterLink(textNode,publicKey,'ebHolder');	
      }
      else if (nodeInSpan(textNode)) { // case 3
        var publicKeys = val.match(re);
        var publicKey = publicKeys[0];
        
        insertSpanAfterSpan(textNode,publicKey,'ebHolder');	
      }
      else { // case 2
        var myRe = /\b0x[a-z0-9A-Z]{40}\b/g;
        
        // From https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/exec
        var myArray;
        var prev = 0;
        var counter = 0;
        var curNode = textNode;
        while ((myArray = myRe.exec(val)) !== null)
        {
          insertSpanInTextNode(curNode,myArray[0],'ebHolder',myRe.lastIndex-prev);		  
          prev = myRe.lastIndex;
          counter = counter + 1;
          curNode = textNode.parentNode.childNodes[2*counter];
        }
      }
    }
  }

  /*
  * Observe mutations for deferred elements and sneak peak them
  * From https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver
  */
  function observeMutations(){
    target = document.body;

    // create an observer instance
    var observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        target = mutation.addedNodes[0];
        main(target);
      });    
    });
    
    // configuration of the observer:
    var config = { attributes: true, childList: true, characterData: true };
    
    // pass in the target node, as well as the observer options
    observer.observe(target, config);  

  }

  /*
  *
  */
  function main(target){
    walk(target);
    addHolderContent(target);
    addEventListenerByClass('etherBalanceIcon', 'click', ebToggle); 
  }

  main(document.body);
  observeMutations();

})();
