import routes from "./routes.json" with  {type: 'json'};
import iconOverwrite from "./icon-overwrite.json" with {type: 'json'};

import loadPositionable from "./modules/loadPositionable.js";
import setInputSize from "./modules/setInputSize.js";

function loadIcons(container = document) {
    const icons = Array.from(container.querySelectorAll('icon'));

    icons.forEach((icon) => {
        let name = icon.getAttribute('name')?.trim();
        const rotate = icon.getAttribute('rotate');
        if(!name) return void 0;
        name = name.replaceAll(':', '--');
        const initialName = name;
        let isNameReplaced = false;

        if(name in iconOverwrite) {
            name = iconOverwrite[name];
            isNameReplaced = true;
        }

        fetch('/asset/icon/'+name+'.svg').then(res => {
            return res.ok ? res.text() : '';
        }).then(svg => {
            if(!svg) return void 0;
            let svgElementHolder = document.createElement('div');
            svgElementHolder.innerHTML = svg.replace(/<!-- Code injected[\s\S]*?<script[\s\S]*?<\/script>\n?/g, '');
            const svgElement = svgElementHolder.querySelector('svg');
            svgElement.setAttribute('x--name', name);
            if(isNameReplaced) {
                svgElement.setAttribute('x--defined-name', initialName);
            }
            if(rotate) svgElement.style.transform = `rotate(${rotate}deg)`;
            svgElement.style.visibility = 'hidden';
            document.documentElement.append(svgElement);
            adjustSVGViewBox(svgElement);
            svgElement.style.removeProperty('visibility');
            if(!svgElement.getAttribute('style')) svgElement.removeAttribute('style');
            icon.replaceWith(svgElement);
        }).catch(err => {
            console.error(err);
        });
    });
}

function adjustSVGViewBox(svg) {
    if(!svg) return void 0;
    const bbox = svg.getBBox();
    // Set the viewBox attribute based on the bounding box
    svg.setAttribute('viewBox', `${bbox.x} ${bbox.y} ${bbox.width} ${bbox.height}`);
}

// ====================================================

// width setup
function loadSameWidthElements(container = document) {
    const sameWidths = Array.from(container.querySelectorAll('[same-width]'));

    sameWidths.forEach(item => {
        const selector = item.getAttribute('same-width');
        const elements = Array.from(item.querySelectorAll(selector));
        const minWidth = elements.map(el => el.offsetWidth).sort((a, b) => b - a)[0] + 1;
        elements.forEach(element => {
            element.style.width = minWidth+'px'
        })
    });
}

// ====================================================

// Include
function loadIncludes(container = document, parentPath = location.pathname, options = {routeGroup: null}) {
    const includes = Array.from(container.querySelectorAll('include'));

    includes.forEach(inc => {
        let path = inc.getAttribute('path');

        if(!path.endsWith('.html')) {
            const pathArray = path.split('/');
            const filename = pathArray.pop();
            path = pathArray.join('/')+(pathArray.length ? '/' : '')+'_'+filename+'.html';
        }
        const url = new URL(path, new URL(parentPath, location.href)).href;
        fetch(url).then(res => {
            return res.text();
        }).then(res => {
            const attributes = Object.fromEntries(Array.from(inc.attributes).map(attr => [attr.name, attr.value]));
            res = res.replace(/(<component[^>].*?>.*?<\/component>)|(?<!\\){{(.*?)}}/gs, function(_, componentTag, name){
                if(name) {
                    name = name.trim();
                    let value = name in attributes ? attributes[name] : null;

                    if(value && value.startsWith('$')) {
                        const valueElement = document.querySelector(`include-attribute[name="${value.replace(/^\$(.*)$/, '$1')}"]`);
                        value = valueElement ? valueElement.innerHTML : null;
                        valueElement.remove();
                    }

                    return value || '';
                }
                if(componentTag) return componentTag;
                return _;
            });

            // const resTempElement = document.createElement('div');
            // resTempElement.innerHTML = res;

            const resShadowElement = document.createElement('div');
            resShadowElement.innerHTML = res;

            if(resShadowElement.querySelectorAll('child-component').length) {
                const childComponent = 
                    !inc.hasAttribute('pick') ?
                    resShadowElement.querySelector('child-component[default]') :
                    resShadowElement.querySelector(`child-component[id="${inc.getAttribute('pick')}"]`);
                
                res = childComponent?.innerHTML || '';
            }

            inc.innerHTML = res;

            const routeGroup = inc.hasAttribute('has-route-group') == '1' ? {
                id: inc.getAttribute('route-group-id'),
                name: inc.getAttribute('route-group-name'),
                icon: inc.getAttribute('route-group-icon'),
                getKeys: inc.getAttribute('route-group-get-keys'),
                get: inc.getAttribute('route-group-get'),
                duplicate: inc.getAttribute('route-group-duplicate') == '1',
                open: inc.getAttribute('route-group-open') == '1'
            } : options.routeGroup;

            loadFunctions(inc, {loadIncludeURL: url, routeGroup});

            const children = Array.from(inc.children);
            children.forEach(node => {
                node.setAttribute('x--source', new URL(url).pathname)
            });

            moveChildrenOut(inc);
        }).catch(err => console.error(err));
    });
}


function loadIncludeComponents(container = document) {
    const components = Object.fromEntries(Array.from(container.querySelectorAll('component')).map(c => {
        c.remove();
        const html = c.innerHTML.replace(/(<img.*?)(source)/g, function(substring, group1, group2){
            return group1+'src';
        });
        return [c.getAttribute('name'), html];
    }));

    Array.from(container.querySelectorAll('use-component')).forEach(ic => {
        const name = ic.getAttribute('name');
        let componentHtml = components[name];

        const attributes = Object.fromEntries(Array.from(ic.attributes).map(attr => [attr.name, attr.value]));

        componentHtml = componentHtml.replace(/(?<!\\){{(.*?)}}/g, function(substring, name){
            name = name.trim();
            return name in attributes ? attributes[name] : substring;
        });

        ic.innerHTML = componentHtml;
        loadFunctions(ic);

        moveChildrenOut(ic);
    });
}


function loadRepeats(container = document) {
    const repeats = Array.from(container.querySelectorAll('repeat:not(repeat repeat)'));

    repeats.forEach((repeat, index) => {
        const repeatTimes = parseInt(repeat.getAttribute('value'));
        const originalContent = repeat.innerHTML;
        let content = '';

        for(let i = 0; i < repeatTimes; i++) content += originalContent;

        content = content.replaceAll(/\$random\((.*?)\)/g, (substring, group1) => {
            if(group1) {
                const options = group1.split('|');
                return options[Math.floor(Math.random() * options.length)];
            }
        });

        repeat.innerHTML = content;
        loadFunctions(repeat);

        moveChildrenOut(repeat);
    });

    if(repeats.length) loadRepeats();

}

// function div() {
//     return document.createElement('div');
// }

class DevSupportRouteList {
    routeList; empty; ul; body;
    totalListItems = 0;
    isOpen = false;
    translation = {
        heading: '',
        exception: ''
    };
    shortcutKey = 'r';
    groups = [];
    routes = [];
    groupFallbackIcon = {
        default: 'mdi-folder-outline',
        active: 'mdi-folder-open-outline'
    }

    onshow = {
        events: [],
        add(func) {
            this.events.push(func);
        },
        remove(func) {
            const index = this.events.indexOf(func);
            if(index < 0) return false;
            this.events.splice(index, 1);
        },
        dispatch() {
            this.events.forEach(func => func());
        }
    };

    onclose = {
        events: [],
        add(func) {
            this.events.push(func);
        },
        remove(func) {
            const index = this.events.indexOf(func);
            if(index < 0) return false;
            this.events.splice(index, 1);
        },
        dispatch() {
            this.events.forEach(func => func());
        }
    };

    constructor(shortcutKey = 'r', heading = 'Route List', exception = 'This page has no routes.') {
        this.translation.heading = typeof heading === 'string' ? heading : heading.title;
        this.translation.exception = exception;
        this.shortcutKey = shortcutKey;

        const routeList = document.createElement('div');
        const header = document.createElement('div');
        const title = document.createElement('div');
        const titleIcon = document.createElement('span');
        const titleIconIcon = document.createElement('icon');
        const titleLabel = document.createElement('span');
        const closeButton = document.createElement('button');
        const empty = document.createElement('div');
        const body = document.createElement('div');
        const ul = document.createElement('ul');


        routeList.classList.add('dev-support__route-list');
        header.classList.add('dev-support__route-list-header');
        title.classList.add('dev-support__route-list-title');
        titleIcon.classList.add('dev-support__route-list-title-icon')
        titleIconIcon.setAttribute('name', heading.icon || '');
        titleLabel.classList.add('dev-support__route-list-title-label');
        titleLabel.innerHTML = this.translation.heading;
        closeButton.classList.add('dev-support__route-list-close');
        closeButton.type = 'button';
        const closeButtonIcon = document.createElement('icon');
        closeButtonIcon.setAttribute('name', 'mdi-close');
        closeButton.append(closeButtonIcon);
        // closeButton.innerHTML = 'X';
        empty.classList.add('dev-support__route-list-empty');
        empty.innerHTML = this.translation.exception;
        body.classList.add('dev-support__route-list-body');
        
        this.routeList = routeList;
        this.empty = empty;
        this.ul = ul;
        this.body = body;

        routeList.append(header);
        routeList.append(body);
        header.append(title, closeButton);
        titleIcon.append(titleIconIcon);
        if(heading.icon) title.append(titleIcon);
        title.append(titleLabel);

        closeButton.addEventListener('click', () => this.hide());


        window.addEventListener('keyup', (event) => {
            if(event.key == 'Escape' && this.isOpen) return this.hide(); 
            if(event.key !== this.shortcutKey) return void 0;
            if(!event.ctrlKey || !event.altKey) return void 0;
            if(event.shiftKey) return void 0;
            event.preventDefault();
            this.toggle();
        });

        // load close icon
        (()=>{
            const $this = this;
            this.onshow.add(onshow);
            this.onclose.add(onclose)
            
            function onshow() {
                loadIcons(header);
            }

            function onclose() {
                $this.onshow.remove(onshow);
                $this.onclose.remove(onclose);
            }
        })();

        (()=>{
            let x = 0;
            let y = 0;
            let width = 0;
            let height = 0;
            const $this = this;

            header.addEventListener('mousedown', (event) => {
                const composedPath = event.composedPath();
                if(composedPath.includes(closeButton)) return void 0;
                const clientRect = routeList.getBoundingClientRect();
                x = event.x - clientRect.x;
                y = event.y - clientRect.y;
                width = clientRect.width;
                height = clientRect.height;

                window.addEventListener('mousemove', mousemove);
                window.addEventListener('mouseup', cancel);
                window.addEventListener('blur', cancel);
                $this.onclose.add(close);
                routeList.setAttribute('data-moving', 'true');
            });

            function mousemove(event) {
                const currentX = event.x;
                const currentY = event.y;


                let left = currentX - x;
                let top = currentY - y;

                if(left < 0) left = 0;
                if(top < 0) top = 0;
                if(left > (innerWidth - width)) left  = innerWidth - width;
                if(top > (innerHeight - height)) top = innerHeight - width;

                routeList.style.left = left+'px';
                routeList.style.top = top+'px';
                routeList.style.right = 'unset';
                routeList.style.bottom = 'unset';
            }

            function close() {
                cancel();
                $this.onclose.remove(close);
                routeList.style.removeProperty('left');
                routeList.style.removeProperty('top');
                routeList.style.removeProperty('right');
                routeList.style.removeProperty('bottom');
            }


            function cancel() {
                window.removeEventListener('mousemove', mousemove);
                window.removeEventListener('mouseup', cancel);
                window.removeEventListener('blur', cancel);
                routeList.removeAttribute('data-moving');
            }
        })();
    }

    addRouteGroup(id, title, icon, isOpenDefault = false) {
        if(this.groups.find(group => group.id == id)) return void 0;
        icon = icon || this.groupFallbackIcon;
        let isOpen = false;
        const group = document.createElement('div');
        const toggle = document.createElement('div');
        const toggleName = document.createElement('div');
        const toggleNameIcon = document.createElement('div');
        // const toggleNameIconDefault = document.createElement('div');
        // const toggleNameIconActive = document.createElement('div');
        const toggleNameLabel = document.createElement('div');
        const toggleStatus = document.createElement('div');
        const menu = document.createElement('div');
        const ul = document.createElement('ul');

        group.classList.add('dev-support__route-list-group');
        toggle.classList.add('dev-support__route-list-group-toggle');
        toggleName.classList.add('dev-support__route-list-group-toggle-name');
        toggleNameIcon.classList.add('dev-support__route-list-group-toggle-name-icon');
        toggleNameLabel.classList.add('dev-support__route-list-group-toggle-name-label');
        toggleStatus.classList.add('dev-support__route-list-group-toggle-status');
        menu.classList.add('dev-support__route-list-group-menu');


        group.append(toggle, menu);
        group.setAttribute('is-active', 'false');
        toggle.append(toggleName, toggleStatus);
        toggleName.append(toggleNameIcon, toggleNameLabel);
        menu.append(ul);

        toggleNameLabel.innerHTML = title;

        // status <icon> element
        const toggleStatusIcon = document.createElement('icon');
        toggleStatusIcon.setAttribute('name', 'gridicons-chevron-down');
        toggleStatus.append(toggleStatusIcon);

        this.body.append(group);

        (()=>{
            let currentActiveIcon = null;
            let isOpenedOnce = false;

            this.onshow.add(() => {
                isOpenedOnce = true;
                setGroupIcon();
                loadIcons(toggleStatus);
                loadIcons(toggleNameLabel);
            });

            function open() {
                if(isOpen) return void 0;
                isOpen = true;
                if(isOpenedOnce) setGroupIcon();
                group.setAttribute('is-active', 'true');
            }
    
            function close() {
                if(!isOpen) return void 0;
                isOpen = false;
                isOpenedOnce && setGroupIcon();
                group.setAttribute('is-active', 'false');
            }
    
            function __toggle() {
                if(isOpen) close();
                else open();
            }
    
            if(isOpenDefault) open();
            
            toggle.addEventListener('click', __toggle);

            function setGroupIcon() {
                if(isOpen && icon.active) {
                    if(currentActiveIcon !== 'active') {
                        const toggleNameIconIcon = document.createElement('icon');
                        toggleNameIconIcon.setAttribute('name', icon.active);
                        toggleNameIcon.innerHTML = '';
                        toggleNameIcon.append(toggleNameIconIcon);
                        loadIcons(toggleNameIcon);
                        currentActiveIcon = 'active';
                    }
                }else if(currentActiveIcon !== 'default') {
                    const toggleNameIconIcon = document.createElement('icon');
                    toggleNameIconIcon.setAttribute('name', icon.default);
                    toggleNameIcon.innerHTML = '';
                    toggleNameIcon.append(toggleNameIconIcon);
                    loadIcons(toggleNameIcon);
                    currentActiveIcon = 'default';
                }
            }
        })();

        const __group = {
            id,
            total: 0,
            element: {
                target: group,
                menu,
                ul
            }
        };

        this.groups.push(__group);
    }

    addRoute(title, link, options = {}) {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = link;
        a.innerText = title;

        if(!options.groupId) this.totalListItems += 1;

        li.append(a);

        if(options.groupId !== null) {
            const group = this.groups.find(gp => gp.id === options.groupId);
            if(group) {
                group.element.ul.append(li);
            }
        }else {
            this.ul.append(li);
        }

        this.routes.push({id: options.id, title, link, groupId: options.groupId});
        loadButtonPush();
    }

    route(id) {
        const foundRoute = this.routes.find((route) => route.id === id);
        return foundRoute || null;
    }

    toggle() {
        // (this.isOpen ? this.hide : this.show)();
        if(this.isOpen) this.hide();
        else this.show();
    }

    show() {
        if(this.isOpen) return void 0;
        this.isOpen = true;

        if(this.totalListItems <= 0) {
            this.ul.remove();
        }else {
            this.body.insertAdjacentElement('afterbegin', this.ul);
        }

        if(this.totalListItems <= 0 && this.groups.length <= 0) {
            this.body.append(this.empty);
        }else {
            this.empty.remove();
        }
        document.documentElement.append(this.routeList);
        this.onshow.dispatch();
    }

    hide() {
        if(!this.isOpen) return void 0;
        this.isOpen = false;
        this.routeList.remove();
        this.onclose.dispatch();
    }

}

const devSupportRouteList = new DevSupportRouteList('r', {title: 'Page Routes'});

function loadRouteGroups(container = document) {
    const routeGroups = Array.from(container.querySelectorAll('route-group'));
    
    routeGroups.forEach((routeGroup, index) => {
        const groupName = routeGroup.getAttribute('name');
        const getKey = routeGroup.getAttribute('get-keys') || '';
        // const getKeyList = (typeof getKey === 'string' ? getKey.split(/\s*&\s*/g) : []);
        const routeGroupGet = routeGroup.getAttribute('get') || '';
        // const get = routeGroupGet ? (routeGroupGet || '').split('&').map(i => i.split('=')) : [];
        const attrIcon = routeGroup.getAttribute('icon');
        let icon = attrIcon ? attrIcon.split(/\s*&\s*/g) : null;
        icon = icon ? {default: icon[0], active: icon[1]} : null;

        
        const __group = {
            id: generateRandomId(),
            name: groupName,
            icon,
            get: routeGroupGet,
            // attr: {
            //     get: routeGroupGet,
            //     getKeys: getKey
            // },
            getKeys: getKey,
            open: index === 0,
            duplicate: routeGroup.hasAttribute('duplicate')
        };

        if(!__group.duplicate) {
            devSupportRouteList.addRouteGroup(__group.id, __group.name, __group.icon, __group.open);
        }

        loadRoutes(routeGroup, __group);
        moveChildrenOut(routeGroup);
    });
}

function loadRoutes(container = document, group = null) {
    const routes = Array.from(container.querySelectorAll('route'));

    routes.forEach(route => {
        const condition = {
            get: route.getAttribute('get')
        };
        let conditionGet = condition.get ? (condition.get || '').split('&').map(i => i.split('=')) : [];
        if(group) {
            const groupGet = group.get ? (group.get || '').split('&').map(i => i.split('=')) : []
            conditionGet = [...groupGet, ...conditionGet];
        }

        const groupGetKeys = (group && group.getKeys && typeof group.getKeys === 'string' ? group.getKeys.split(/\s*&\s*/g) : []);


        if(group && groupGetKeys.length) {
            const getValues = (route.getAttribute('get-values') || '').split(/\s*&\s*/g);
            const getKeyValues = groupGetKeys.map((key, index) => {
                let value = getValues[index]||'';
                const isOptional = value.startsWith('?') ? true : false;
                value = value.replace(/^\?/g, '');
                return [key + (isOptional ? '?' : ''), value];
            });


            conditionGet = [...getKeyValues, ...conditionGet];
        }


        const validConditionGet = conditionGet.map(([key, value]) => {
            key = key.replace(/(.*?)(\?)?/g, "$1");
            if(key.startsWith('!')) return '';
            return !value ? key : key + '=' + value;
        }).filter(i => i).join('&');
        const link = new URL(location.href);
        link.search = validConditionGet;
        const name = route.getAttribute('name') || '?'+validConditionGet;


        if((!group || !group.duplicate) && !route.hasAttribute('duplicate')) {
            devSupportRouteList.addRoute(name, link.href, {groupId: group ? group.id : null, id: route.getAttribute('id') || generateRandomId()});
        }

        const urlGet = Array.from(new URLSearchParams(location.search).entries());
        
        const conditionSatisfied = conditionGet.every(([conditionGetKey, conditionGetValue]) => {
            const conditionGetKeyRefined = conditionGetKey.replace(/[\?!]/g, "");

            let conditionGetFoundOnURLGet = urlGet.find(([urlGetKey]) => urlGetKey == conditionGetKeyRefined);

            if(conditionGetKey.startsWith('!')) { // checking for exceptions
                if(conditionGetFoundOnURLGet) {
                    if(!conditionGetValue) return false;
                    if(conditionGetValue === conditionGetFoundOnURLGet[1]) return false;
                }else {
                    return true;
                }
            }
            
            if(conditionGetKey.endsWith('?') && !conditionGetFoundOnURLGet) { // checking optional
                return true;
            }

            return !!urlGet.find(([urlGetKey, urlGetValue]) => { // checking key and value
                if(urlGetKey === conditionGetKeyRefined && (conditionGetValue === undefined || urlGetValue === conditionGetValue)) {
                    return true;
                }
                return false;
            });
        });



        if(!conditionSatisfied) {
            route.remove();
        }else {
            const includeElements = Array.from(route.querySelectorAll('include'));
            if(group) {
                includeElements.forEach(includeElement => {
                    includeElement.setAttribute('has-route-group', '1');
                    includeElement.setAttribute('route-group-get', group.get);
                    includeElement.setAttribute('route-group-get-keys', group.getKeys);
                    includeElement.setAttribute('route-group-name', group.name);
                    includeElement.setAttribute('route-group-id', group.id);
                    includeElement.setAttribute('route-group-icon', group.icon);
                    includeElement.setAttribute('route-group-duplicate', group.duplicate ? '1' : '0');
                    includeElement.setAttribute('route-group-open', group.open ? '1' : '0');
                });
            }
            moveChildrenOut(route);
            if((!group || !group.duplicate) && !route.hasAttribute('duplicate')) {
                if(name) document.title = name + ' - ' + document.head.querySelector('title').innerText;
            }
        }
    });
}

// main routes
const devSupportMainRouteList = new DevSupportRouteList('e', {title: 'Main Routes', icon: null});

routes.forEach((route, index) => {
    if('group' in route) {
        const groupId = generateRandomId();
        devSupportMainRouteList.addRouteGroup(groupId, route.group, route.icon || devSupportMainRouteList.groupFallbackIcon, index === 0);
        route.items.forEach(item => {
            devSupportMainRouteList.addRoute(item.name, item.url, {groupId});
        });
    }else {
        devSupportMainRouteList.addRoute(route.name, route.url);
    }
});

function loadButtonPush(container = document) {
    const buttons = Array.from(container.querySelectorAll('[push]:not(repeat [push], include-attribute [push])'));

    buttons.forEach(button => {
        let definedPath = button.getAttribute('push');
        if(definedPath.startsWith('$')) {
            definedPath = definedPath.replace(/\$(.*?$)/, '$1');
            const definedPathRoute = devSupportRouteList.route(definedPath);
            if(!definedPathRoute) return void 0;
            definedPath = definedPathRoute.link;
        }

        button.setAttribute('x--push', button.getAttribute('push'));
        button.removeAttribute('push');
        button.addEventListener('click', (event) => {
            event.preventDefault();
            let path = location.href;

            const definedPathURL = new URL(definedPath, location.href);
            const currentPathURL = new URL(location.href);
            let definedPathURLSearchParams = Array.from(new URLSearchParams(definedPathURL.search).entries());
            const currentPathURLSearchParams = Array.from(new URLSearchParams(currentPathURL.search).entries());

            const indexesToRemove = [];

            if(!event.ctrlKey) {
                definedPathURLSearchParams.forEach((searchItem, index) => {
                    const foundOnCurrent = currentPathURLSearchParams.findIndex(([key, value]) => key == searchItem[0] && value == searchItem[1]);
                    if(foundOnCurrent < 0) return void 0;
                    currentPathURLSearchParams.splice(foundOnCurrent, 1);
                    indexesToRemove.push(index);
                });
    
                indexesToRemove.forEach((index) => definedPathURLSearchParams.splice(index, 1, null));
            }
            definedPathURLSearchParams = definedPathURLSearchParams.filter(param => param !== null);
            
            const combinedSearchParams = [...currentPathURLSearchParams, ...definedPathURLSearchParams];
            const finalSearchString = Object.entries(Object.fromEntries(combinedSearchParams)).map(i => i.join(i[1] ? '=' : '')).join('&');
            if(definedPathURL.origin === currentPathURL.origin) {
                path = new URL(finalSearchString ? '?' + finalSearchString : location.pathname, location.href);
            }else {
                path = definedPathURL;
            }
            if(event.ctrlKey) return open(path);
            location.href = path;
        });
    });
}

function loadBoxShadowOnScrolls(container = document) {
    const scrollableElements = Array.from(container.querySelectorAll('[box-shadow-on-scroll]'));

    scrollableElements.forEach(scrollableElement => {
        const value = scrollableElement.getAttribute('box-shadow-on-scroll');

        const methods = {
            ondown(selector) {
                const element = scrollableElement.querySelector(selector);
                if(!element) return void 0;
                scrollableElement.addEventListener('scroll', ()=>{
                    toggle();
                });
                toggle();


                function toggle() {
                    if(scrollableElement.scrollTop > 0) {
                        element.setAttribute('has-box-shadow', 'true');
                    }else {
                        element.removeAttribute('has-box-shadow');
                    }
                }
            },
            onup(selector) {
                const element = scrollableElement.querySelector(selector);
                if(!element) return void 0;
                scrollableElement.addEventListener('scroll', ()=>{
                    toggle();
                });
                toggle();

                function toggle() {
                    if(scrollableElement.scrollTop + scrollableElement.offsetHeight < scrollableElement.scrollHeight) {
                        element.setAttribute('has-box-shadow', 'true');
                    }else {
                        element.removeAttribute('has-box-shadow');
                    }
                }
            },
            onright(selector) {
                const element = scrollableElement.querySelector(selector);
                if(!element) return void 0;
                scrollableElement.addEventListener('scroll', ()=>{
                    toggle();
                });
                toggle();

                function toggle() {
                    if(scrollableElement.scrollLeft > 0) {
                        element.setAttribute('has-box-shadow', 'true');
                    }else {
                        element.removeAttribute('has-box-shadow');
                    }
                }
            },
            onleft(selector) {
                const element = scrollableElement.querySelector(selector);
                if(!element) return void 0;
                scrollableElement.addEventListener('scroll', ()=>{
                    toggle();
                });
                toggle();

                function toggle() {
                    if(scrollableElement.scrollLeft + scrollableElement.scrollWidth < scrollableElement.scrollWidth) {
                        element.setAttribute('has-box-shadow', 'true');
                    }else {
                        element.removeAttribute('has-box-shadow');
                    }
                }
            }
        }

        const ondown = /ondown\((.*?)\)/g.exec(value);
        const onup = /onup\((.*?)\)/g.exec(value);
        const onright = /onright\((.*?)\)/g.exec(value);
        const onleft = /onleft\((.*?)\)/g.exec(value);

        if(ondown) methods.ondown(ondown[1].trim());
        if(onup) methods.onup(onup[1].trim());
        if(onright) methods.onright(onright[1].trim());
        if(onleft) methods.onleft(onleft[1].trim());
    });
}

function loadArray(container = document) {
    const loadArrayElemenets = Array.from(container.querySelectorAll('[load-array]'));

    loadArrayElemenets.forEach(loadArrayElemenet => {
        const html = loadArrayElemenet.innerHTML;

        loadArrayElemenet.innerHTML = '';
        const filename = loadArrayElemenet.getAttribute('load-array');
        loadArrayElemenet.setAttribute('x--load-array', filename);
        loadArrayElemenet.removeAttribute('load-array');
        fetch('/asset/data/'+filename+'.json').then(res => {
            return res.json();
        }).then(data => {
            data = Array.isArray(data) ? data : Object.values(data);
            // const arraySortKey = loadArrayElemenet.getAttribute('array-sort');

            // if(loadArrayElemenet.hasAttribute('array-sort')) {
            //     data.sort((a, b) => {
            //         if(arraySortKey) {
            //             return a[arraySortKey] > b[arraySortKey];
            //         }
            //         return a < b;
            //     });
            //     // console.log(data.isSorted());
            //     console.log(data);
            // }

            data.forEach((dataItem, index) => {
                let newHTML = html;
                const htmlCodeVirtualDOM = document.createElement('div');
                htmlCodeVirtualDOM.innerHTML = newHTML;
                Array.from(htmlCodeVirtualDOM.querySelectorAll('match-index')).forEach((matchIndexElement) => {
                    const matchIndexList = (matchIndexElement.getAttribute('value') || '').split(',').filter(i => i.trim()).map(i => parseInt(i));
                    if(matchIndexList.includes(index)) {
                        moveChildrenOut(matchIndexElement);
                        return void 0;
                    }else {
                        matchIndexElement.remove();
                    }
                });
                Array.from(htmlCodeVirtualDOM.querySelectorAll('match-value')).forEach((matchValueElement) => {
                    const matchValuePath = (matchValueElement.getAttribute('value-path') || '').split('.').filter(i => i);
                    const matchValueList = (matchValueElement.getAttribute('value') || '').split(',').map(i => i.trim()).filter(i => i);

                    const matched = matchValueList.some(value => {
                        const matchValue = matchValuePath.length ? objectGetValueFromPath(dataItem, matchValuePath) : dataItem;
                        return matchValue == value;
                    });
                    if(matched) {
                        moveChildrenOut(matchValueElement);
                    }else {
                        matchValueElement.remove();
                    }
                });

                newHTML = htmlCodeVirtualDOM.innerHTML;
                newHTML = newHTML.replace(/(?<!\\){{(.*?)}}/g, function(substring, name){
                    name = name.trim();
                    return name in dataItem ? dataItem[name] : substring;
                });

                loadArrayElemenet.insertAdjacentHTML('beforeend', newHTML);
            })

            loadFunctions(loadArrayElemenet);
        }).catch(err => console.error(err))
    });
}

function loadSetAttributeIfUrlHas(container = document) {
    const elements = Array.from(container.querySelectorAll('[set-attribute-if-url-has]'));

    const urlGetParams = new URLSearchParams(window.location.search);
    elements.forEach((element)=>{
        const conditions = element.getAttribute('set-attribute-if-url-has').split('&&').map(i => i.split('=>'));

        conditions.forEach(([condition, value]) => {
            const getList = condition.split('&').map(i => i.split('='));
            const attribute = value.split('::').map(i => i.trim());

            const conditionSatisfied = getList.every(([getKey, getValue]) => {
                const getKeyRefined = getKey.replace(/^!?(.*?)\??$/g, '$1');

                if(getKey.endsWith('?')) {
                    if(!urlGetParams.has(getKeyRefined)) return true;
                    if(getKey.startsWith('!')) {
                        return urlGetParams.get(getKeyRefined) !== getValue;
                    }
                    return urlGetParams.get(getKeyRefined) === getValue;
                }

                if(getKey.startsWith('!')) {
                    if(!getValue) {
                        if(!urlGetParams.has(getKeyRefined)) return true;
                        return false;
                    }
                    if(urlGetParams.get(getKeyRefined) !== getValue) return true;
                    return false;
                }

                if(!getValue && urlGetParams.has(getKeyRefined)) return true;
                return urlGetParams.get(getKeyRefined) === getValue;
            });

            if(conditionSatisfied && attribute[0]) {
                element.setAttribute(attribute[0], attribute[1]||'');
            }
        });

    });
}

function loadResizeWidth(container = document) {
    const elements = Array.from(container.querySelectorAll('[resize-width]'));

    elements.forEach(element => {
        const changeTo = element.getAttribute('resize-width')
            .split('&&')
            .map(i => i.split('=>').map(a => a.trim()))
            .map(([selector, cssProperty]) => {
                return [document.querySelector(selector), cssProperty.split(',').map(a => a.trim())]
            })
            .filter(a => a[0]);
        const resizeableElement = changeTo[0][0];
        const resizeWidthMin = parseFloat(element.getAttribute('resize-width-min')) || 0;
        const resizeWidthMax = parseFloat(element.getAttribute('resize-width-max')) || null;

        const init = {
            x: 0
        }

        element.addEventListener('mousedown', (event)=>{
            init.x = event.x;
            init.width = resizeableElement.offsetWidth;
            window.addEventListener('mousemove', windowMousemove);
            window.addEventListener('mouseup', windowMouseUp);
            element.setAttribute('is-active', 'true');
            resizeableElement.setAttribute('resize-mode-on', 'true');
        });

        function windowMousemove(event) {
            const widthChange = event.x - init.x;
            let width = (init.width + widthChange);
            if(typeof resizeWidthMax == 'number' && width > resizeWidthMax) {
                width = resizeWidthMax;
            }
            if(width < resizeWidthMin) {
                width = resizeWidthMin;
            }

            changeTo.forEach(([el, properties]) => {
                properties.forEach(prop => {
                    el.style[prop] = width + 'px';
                });
            });

            // resizeableElement.style.width = width + 'px';
            // main.style.marginLeft = width + 'px';
            // topbar.style.left = width + 'px';
        }

        function windowMouseUp() {
            end();
        }

        function end() {
            window.removeEventListener('mousemove', windowMousemove);
            window.removeEventListener('mouseup', windowMouseUp);
            element.removeAttribute('is-active');
            resizeableElement.removeAttribute('resize-mode-on');
        }
    })
}

function loadFunctions(root = document, options={}) {
    loadSetAttributeIfUrlHas(root);
    loadRouteGroups(root);
    loadRoutes(root, options.routeGroup);
    loadIcons(root);
    loadSameWidthElements(root);
    loadIncludes(root, options.loadIncludeURL, options);
    loadIncludeComponents(root);
    loadRepeats(root);
    loadButtonPush(root);
    loadBoxShadowOnScrolls(root);
    loadArray(root);
    loadResizeWidth(root);
    loadPositionable(root);
    setInputSize(document);
}

// window.addEventListener('DOMContentLoaded', ()=>{
//     loadFunctions(document);
// });

loadFunctions(document, {init: true});


// Helpers


function objectGetValueFromPath(object, path) {
    if(!path.length) return object;
    return objectGetValueFromPath(object?.[path[0]], path.slice(1, path.length));
}

function moveChildrenOut(parent) {
    const children = Array.from(parent.childNodes);

    children.forEach(node => {

        if(node.nodeType === Node.TEXT_NODE) {
            parent.insertAdjacentText('beforebegin', node.data);
        }else if(node.nodeType === Node.COMMENT_NODE) {
            parent.insertAdjacentHTML('beforebegin', `<!--${node.nodeValue}-->`);
        }else {
            parent.insertAdjacentElement('beforebegin', node);
        }
    });
    parent.remove();
}

function range(start, end) {
    if (typeof start === 'number' && typeof end === 'number') {
        return Array.from({ length: end - start + 1 }, (_, i) => i + start);
    } else if (typeof start === 'string' && typeof end === 'string') {
        return String.fromCharCode(
            ...range(start.charCodeAt(0), end.charCodeAt(0))
        ).split('');
    }
    return [];
}

function generateRandomId(length = 12) {
    const numbers = range('0', '9');
    const upperAlpha = range('A', 'Z');
    const lowerAlpha = range('a', 'z');
    const alpha = [...upperAlpha, ...lowerAlpha];
    const combined = [...numbers, ...alpha];

    let randomString = '';

    for(let i = 0; i < length; i++) {
        if(i === 0) randomString+= alpha[Math.floor((Math.random() * alpha.length))];
        else randomString+= combined[Math.floor((Math.random() * combined.length))];
    }

    return randomString;
}

window.devSupport = {};

window.devSupport.toggleAttr = (el, key, val = 'true') => {
    if(!el) return void 0;
    el.getAttribute(key) !== val ? el.setAttribute(key, val) : el.removeAttribute(key);
}
