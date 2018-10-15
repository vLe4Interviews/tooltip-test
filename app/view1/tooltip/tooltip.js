(function() {
    const tooltipManager = new TooltipManager();

    angular.module("myApp.view1")
        .directive("tooltip", ["$document", "$window", function($document, $window) {
            const documentBody = $document[0].body;

            function link(scope, element, attrs) {
                let tooltipDom = null;
                let showing = false;

                element.on("click", (e) => (showing ? hideTooltip : showTooltip)(e));

                function showTooltip(e) {
                    if (e) {
                        e.preventDefault();
                        e.stopPropagation();
                    }

                    tooltipManager.toggleActive(scope.$id);
                    documentBody.appendChild(getTooltip());
                    showing = true;
                    calculateTooltipCss();
                }

                function hideTooltip(e) {
                    if (e) {
                        e.preventDefault();
                        e.stopPropagation();
                    }

                    if (showing) {
                        documentBody.removeChild(tooltipDom);
                        showing = false;
                    }
                }

                function calculateTooltipCss() {
                    const containerWidth = element[0].offsetWidth;
                    const elementDomRect = element[0].getBoundingClientRect();
                    const scrollX = $window.scrollX;
                    const scrollY = $window.scrollY;
                    const tooltipWidth = tooltipDom.offsetWidth;
                    const tooltipHeight = tooltipDom.offsetHeight;

                    tooltipDom.style.top = `${scrollY + elementDomRect.y - tooltipHeight - 10}px`;
                    tooltipDom.style.left = `${scrollX + elementDomRect.x + (containerWidth - tooltipWidth) / 2}px`;
                }

                function getTooltip() {
                    if (!tooltipDom) {
                        tooltipDom = document.createElement("div");
                        tooltipDom.classList.add("tooltip");
                        tooltipDom.innerText = scope.message;
                        tooltipDom.onclick = (e) => { e.preventDefault(); e.stopPropagation(); };
                    }

                    return tooltipDom;
                }

                tooltipManager.register(scope.$id, hideTooltip);

                scope.$on("$destroy", () => { tooltipManager.deregister(scope.$id); });
            }

            return {
                link: link,
                restrict: "A",
                scope: {
                    message: "@tooltipMessage"
                }
            }
        }]);

    function TooltipManager() {
        let tooltipComponents = {};
        let activeId = 0;
        let registeredEvents = false;

        this.register = function(id, hideTooltipFn) {
            tooltipComponents[id] = hideTooltipFn;

            if (!registeredEvents) {
                registeredEvents = true;
                angular.element(document).on("click", () => this.toggleActive(null));
                angular.element(document).on("keydown", (e) => {
                    if (e.keyCode === 27) {
                        this.toggleActive(null);
                    }
                });
            }
        }

        this.deregister = function(id) {
            delete tooltipComponents[id];
        }

        this.toggleActive = function(newActiveId) {
            const hideTooltipFn = tooltipComponents[activeId];
            if (hideTooltipFn && activeId !== newActiveId) {
                hideTooltipFn();
            }
            activeId = newActiveId;
        }


    }
})();
