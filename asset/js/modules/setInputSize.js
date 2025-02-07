export default function(container = document) {
    const elements = container.querySelectorAll('input[max-content]');

    elements.forEach(element => {
        element.removeAttribute('max-content');
        element.setAttribute('x--max-content', '');
        const minWdith = element.hasAttribute('min-width') ? parseInt(element.getAttribute('min-width')) : 0;

        element.addEventListener('input', setSize);


        function setSize() {
            element.style.width = '0px';
            const scrollWidth = element.scrollWidth;

            element.style.width = (scrollWidth < minWdith ? minWdith : scrollWidth) + 'px';
        }

        setSize();
    });
}