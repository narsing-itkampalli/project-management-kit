import commandHistory from "./commandHistory.js";

function loadPositionable(container = document) {
    const elements = Array.from(container.querySelectorAll('[positionable]'));
    // const fixedPositionElements = Array.from(container.querySelectorAll('*')).filter(element => getComputedStyle(element).position == 'fixed');

    elements.forEach(element => {
        let numberOfChanges = 0;

        const inititalPosition = {
            element: {
                left: 0,
                top: 0,
                right: '',
                bottom: ''
            },
            cursor: {
                x: 0,
                y: 0
            }
        };
        let isMouseMoved = false;

        const elementCurrentPosition = {
            left: inititalPosition.element.left,
            top: inititalPosition.element.top
        };

        element.addEventListener('mousedown', start);
        element.removeAttribute('positionable');
        element.setAttribute('x--positionable', '');
        
        function start(event) {
            isMouseMoved = false;
            const elementBoundingClientRect = element.getBoundingClientRect();

            inititalPosition.element.left = elementBoundingClientRect.x;
            inititalPosition.element.top = elementBoundingClientRect.y;

            inititalPosition.cursor.x = event.x;
            inititalPosition.cursor.y = event.y;

            window.addEventListener('mousemove', changePosition);
            window.addEventListener('mouseup', stop);
            window.addEventListener('blur', stop);
            element.style.userSelect = 'none';
        }

        function changePosition(event) {
            if(!isMouseMoved) {
                isMouseMoved = true;
                numberOfChanges += 1;
            }
            const cursorPositionDifference = {
                x: event.x - inititalPosition.cursor.x,
                y: event.y - inititalPosition.cursor.y
            };

            elementCurrentPosition.x = inititalPosition.element.left + cursorPositionDifference.x;
            elementCurrentPosition.y = inititalPosition.element.top + cursorPositionDifference.y;

            element.style.left = elementCurrentPosition.x + 'px';
            element.style.top = elementCurrentPosition.y + 'px';
            element.style.bottom = 'unset';
            element.style.right = 'unset';
        }

        function stop() {
            window.removeEventListener('mousemove', changePosition);
            window.removeEventListener('mouseup', stop);
            window.removeEventListener('blur', stop);
            element.style.removeProperty('user-select');

            const elementPosition = {
                previous: {
                    x: inititalPosition.element.left,
                    y: inititalPosition.element.top
                },
                current: {
                    x: elementCurrentPosition.x,
                    y: elementCurrentPosition.y
                }
            }

            function undo() {
                element.style.left = elementPosition.previous.x + 'px';
                element.style.top = elementPosition.previous.y + 'px';
                numberOfChanges -= 1;

                if(numberOfChanges <= 0) {
                    element.style.removeProperty('left');
                    element.style.removeProperty('top');
                    element.style.removeProperty('right');
                    element.style.removeProperty('bottom');
                }
            }

            function redo() {
                element.style.left = elementPosition.current.x + 'px';
                element.style.top = elementPosition.current.y + 'px';
                element.style.bottom = 'unset';
                element.style.right = 'unset';
                numberOfChanges += 1;
            }

            if(isMouseMoved) {
                commandHistory.undo.push({undo, redo});
                commandHistory.clearRedo();
            }
        }
    });
}


export default loadPositionable;