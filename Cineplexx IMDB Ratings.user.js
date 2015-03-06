// ==UserScript==
// @name         Cineplexx IMDB Ratings
// @namespace    http://andre-baumeier.de/
// @version      0.1
// @description  Displays imdb ratings for movies on overview page http://www.cineplexx.at/filme/kinoprogramm/
// @author       Andre Baumeier
// @grant        none
// @include      http://www.cineplexx.at/filme/kinoprogramm/
// @require       http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js
// ==/UserScript==

function waitForKeyElements (
    selectorTxt,    /* Required: The jQuery selector string that
                        specifies the desired element(s).
                    */
    actionFunction, /* Required: The code to run when elements are
                        found. It is passed a jNode to the matched
                        element.
                    */
    bWaitOnce,      /* Optional: If false, will continue to scan for
                        new elements even after the first match is
                        found.
                    */
    iframeSelector  /* Optional: If set, identifies the iframe to
                        search.
                    */
) {
    var targetNodes, btargetsFound;

    if (typeof iframeSelector == "undefined")
        targetNodes     = $(selectorTxt);
    else
        targetNodes     = $(iframeSelector).contents ()
                                           .find (selectorTxt);

    if (targetNodes  &&  targetNodes.length > 0) {
        btargetsFound   = true;
        /*--- Found target node(s).  Go through each and act if they
            are new.
        */
        targetNodes.each ( function () {
            var jThis        = $(this);
            var alreadyFound = jThis.data ('alreadyFound')  ||  false;

            if (!alreadyFound) {
                //--- Call the payload function.
                var cancelFound     = actionFunction (jThis);
                if (cancelFound)
                    btargetsFound   = false;
                else
                    jThis.data ('alreadyFound', true);
            }
        } );
    }
    else {
        btargetsFound   = false;
    }

    //--- Get the timer-control variable for this selector.
    var controlObj      = waitForKeyElements.controlObj  ||  {};
    var controlKey      = selectorTxt.replace (/[^\w]/g, "_");
    var timeControl     = controlObj [controlKey];

    //--- Now set or clear the timer as appropriate.
    if (btargetsFound  &&  bWaitOnce  &&  timeControl) {
        //--- The only condition where we need to clear the timer.
        clearInterval (timeControl);
        delete controlObj [controlKey]
    }
    else {
        //--- Set a timer, if needed.
        if ( ! timeControl) {
            timeControl = setInterval ( function () {
                    waitForKeyElements (    selectorTxt,
                                            actionFunction,
                                            bWaitOnce,
                                            iframeSelector
                                        );
                },
                300
            );
            controlObj [controlKey] = timeControl;
        }
    }
    waitForKeyElements.controlObj   = controlObj;
}

/*--- waitForKeyElements():  A utility function, for Greasemonkey scripts,
    that detects and handles AJAXed content.

    Usage example:

        waitForKeyElements (
            "div.comments"
            , commentCallbackFunction
        );

        //--- Page-specific function to do what we want when the node is found.
        function commentCallbackFunction (jNode) {
            jNode.text ("This comment changed by waitForKeyElements().");
        }

    IMPORTANT: This function requires your script to have loaded jQuery.
*/

function insertLegendButton() {
    $button = $('.imdb-ratings-action');
    if (!$button.length) {
    $('.legende').after('<p class="imdb-ratings-action"><input type="button" value="check imdb ratings" /></p>');
        $('.imdb-ratings-action input').click(checkIMDBRatings);
    } else {
    }
  
}

waitForKeyElements (
  ".legende"
  , insertLegendButton
);

function checkIMDBRatings() {
    $('.userscripts-imdb-ratings').remove();
    $('.overview-element h2').after('<p class="userscripts-imdb-ratings">IMDB: loading</p>');
    $.each($('.overview-element h2'), function(i, val) {
        //console.log(i);
        //console.log(val);
        
        
        var $this = $(this);
        var $title = $this.text();
        //console.log($title);
        
        //console.log('$rating_element:');
        //var $rating_element = $this.closest('.overview-element').find('.userscripts-imdb-ratings');
        //console.log($rating_element);
        var $rating_element = $('.userscripts-imdb-ratings').eq(i);
        //console.log($rating_element);
        
        $.ajax({
            url: "http://imdb.wemakesites.net/api/1.0/get/title/",
            data: {
                q: $title
            },
            dataType: "jsonp",
            crossDomain: true,
            rating_element: $rating_element,
            success: function(response) {
                //console.log("response:");
                //console.log(response.data);
                //console.log(response.data.rating);
                //console.log(this.rating_element);
                this.rating_element.text('IMDB: ' + response.data.rating);
            }
        });
    });
  
}