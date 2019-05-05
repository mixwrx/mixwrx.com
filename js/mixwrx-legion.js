
var legion = (function () {

    var constants = {
        body: "legion-body",
        pageTiles: "legion-page-tiles",
        dataUrl: "data-tile-url",
    };

    var utilities = {
        getElements: function (selector) {

            var $items = Array.prototype.slice.call(document.querySelectorAll(selector), 0);

            return $items;
        },
        getHtml: function (url, onSuccess, onError) {

            var xhr = new XMLHttpRequest();

            xhr.open("GET", url);

            xhr.onload = function () {

                if (xhr.status === 200) {

                    onSuccess(xhr.responseText);
                } else {

                    onError(xhr.status);
                }
            };

            xhr.send();
        },
        findAncestorWithClass: function ($element, className) {

            while (($element = $element.parentElement) && !$element.classList.contains(className));

            return $element;
        },
        findAncestorOfType: function ($element, tagName) {

            while (($element = $element.parentElement) && $element !== null && $element.tagName.toLowerCase() !== tagName);

            return $element;
        }
    };

    var handlers = {
        applyPageHandling: function () {

            setPageNavigationHandlers();

            tileExpanderToggle("legion-feed-item-list-header");
        },
    };

    var navigation = {
        replaceTiles: function ($items, $item) {

            for (var x = 0; x < $items.length; x++) {

                if ($items[x].hasAttribute(constants.dataUrl)) {

                    var $parent = utilities.findAncestorOfType($items[x], "li");

                    $parent.classList.remove("is-active");
                }
            }

            var $parent = utilities.findAncestorOfType($item, "li");

            $parent.classList.add("is-active");

            var url = $item.getAttribute("href");

            var dataUrl = $item.getAttribute(constants.dataUrl);

            if (dataUrl === undefined || dataUrl === null) return true;

            utilities.getHtml(dataUrl, function (text) {

                var $tiles = document.getElementById(constants.pageTiles);

                $tiles.innerHTML = text;

                var $body = document.getElementById(constants.body);

                window.history.pushState({ html: $body.innerHTML, path: url }, window.document.title, url);

                handlers.applyPageHandling();

            }, function error(status) {

            });
        },
        navigatePage: function ($item) {

            var url = $item.getAttribute("href");

            if (url === undefined || url === null) return true;

            utilities.getHtml(url, function (text) {

                var $body = document.getElementById(constants.body);

                $body.innerHTML = text;

                window.history.pushState({ html: $body.innerHTML, path: url }, window.document.title, url);

                handlers.applyPageHandling();

            }, function error(status) {

            });
        }
    };

    var cache = {
        menu:null,
        navigationItems: null
    };

    function tileClickHandler(event) {

        var $target = event.currentTarget;

        if ($target.hasAttribute(constants.dataUrl)) {

            navigation.replaceTiles(cache.navigationItems, $target);

            event.preventDefault();
            event.stopPropagation();

            return false;

        } else {

            //navigation.navigatePage($item);
        }
    }

    function setHandler($item) {

        $item.removeEventListener("click", tileClickHandler);

        $item.addEventListener("click", tileClickHandler);
    }

    function setPageNavigationHandlers() {

        if (cache.navigationItems.length > 0) {

            for (var x = 0; x < cache.navigationItems.length; x++) {

                var $item = cache.navigationItems[x];

                setHandler($item);
            }
        }
    }

    function tileExpanderToggle(selector) {

        var $items = utilities.getElements(selector);

        if ($items.length > 0) {

            for (var i = 0; i < $items.length; i++) {

                $items[i].addEventListener("click", function (event) {

                    this.parentNode.classList.toggle("collapsed");

                    var content = this.parentNode.children[1];

                    if (content !== undefined && content !== null) {

                        content.classList.toggle("hidden");
                    }

                    event.preventDefault();
                    event.stopPropagation();

                    return false;

                });
            }
        }
    }

    function toggleDisplay(event) {

        cache.menu.style.display = cache.menu.style.display === "block"
            ? "none"
            : "block";

        event.preventDefault();
        event.stopPropagation();

        return false;
    }

    return {
        setup: function () {

            var $body = document.getElementById(constants.body);

            cache.navigationItems = utilities.getElements(".lg-feed-navbar a");

            cache.menu = $body.getElementsByClassName("navbar-menu")[0];

            handlers.applyPageHandling();

            window.history.replaceState({ html: $body.innerHTML, path: document.location.href }, window.document.title, document.location.href);

            var $burgerMenu = $body.getElementsByClassName("navbar-burger")[0];

            if ($burgerMenu === undefined) return;

            $burgerMenu.removeEventListener("click", toggleDisplay, true);
            $burgerMenu.addEventListener("click", toggleDisplay, true);
        }
    };

}());

document.addEventListener("DOMContentLoaded", function () {

    legion.setup();
});

//window.history.pushState({ html: document.documentElement.innerHTML, path: window.location.href }, window.document.title, window.location.href); 

window.onpopstate = function (e) {

    if (e.state) {

        var $body = document.getElementById("legion-body");

        $body.innerHTML = e.state.html;
    }
};