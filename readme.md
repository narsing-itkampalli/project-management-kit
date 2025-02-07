# Project Management Components (Clean code)

This repository contains a collection of project management system-related components, developed with a focus on clean coding, structured file organization, and adherence to best practices in UI/UX design. The components follow the **CSS BEM (Block Element Modifier) convention** to ensure maintainability and scalability.

## Purpose

The main goal of this repository is to showcase:
- Clean and structured SCSS (Sass) for styling and file organization.
- **BEM methodology** for CSS class naming.
- **UI/UX design knowledge**, including spacing, typography, and accessibility considerations.
- Reusable and scalable **project management components**.
- **Custom JavaScript functionality** for dynamically loading components.

## Live Preview

The components are hosted on **Firebase** for easy viewing. You can access them here:
[Live Demo](https://project-management-kit.web.app)

## Dynamic Component Loading

This project includes a **JavaScript-based component loading system** that allows reusing the same component across multiple HTML files using a custom `<include>` tag.

### Example Usage:
```html
<include path="login/form"></include>
```

The script automatically replaces `<include>` elements with the corresponding component's HTML content. Additionally, navigation is handled by dynamically loading new content based on the URL when a button or link is clicked, instead of using single-page application (SPA) techniques.

## BEM Naming Convention

The project follows the **BEM (Block Element Modifier)** methodology for CSS class names, ensuring modular and reusable styles. The use of SCSS nesting further enhances maintainability by keeping styles structured within their respective blocks.

## Block: `notification-popup`
The main container for the notification popup.

```html
<div class="notification-popup" hide-arrow="false">
    <span class="notification-popup-position-arrow"></span>
    <div class="notification-popup__container">
        <div class="notification-popup__header">
            <div class="notification-popup__header-row notification-popup__header-row--title-row">
                <div class="notification-popup__header-row-column">
                    <h2 class="notification-popup__header-heading">Notifications</h2>
                </div>
                <div class="header-row-column">
                    <div class="notification-popup__header-action-list">
                        <button type="button" class="notification-popup__header-action-list-item notification-popup__header-action-list-item--mark-all" has-label="true">
                            <span class="notification-popup__header-action-list-item-icon">
                                <icon name="la--check-double"></icon>
                            </span>
                            <span class="notification-popup__header-action-list-item-text">
                                Mark all read
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <div class="notification-popup__body">
            <div class="notification-popup__list-group">
                <include path="notification-popup/notification-list"></include>
            </div>
        </div>
        <div class="notification-popup__footer">
            <div class="notification-popup__footer-column">
                <div class="notification-popup__footer-action-list">
                    <button type="button" class="notification-popup__footer-action-list-item">
                        <span class="notification-popup__footer-action-list-item-icon">
                            <icon name="mdi--volume-high"></icon>
                        </span>
                    </button>
                </div>
            </div>
        </div>
    </div>
</div>
```

## Elements & Modifiers

### Position Arrow (`notification-popup-position-arrow`)
Defines the visual position indicator.
```scss
.notification-popup-position-arrow {
    position: absolute;
    width: 0px;
    border: 8px solid transparent;
    border-left-color: white;
    border-top-color: white;
    top: -8px;
    left: 358px;
    transform: rotate(45deg);
    box-shadow: 0 -3px 8px rgb(0 0 0 / 26%);
    z-index: 1;
}
```

### Header (`notification-popup__header`)
Defines the top section of the popup with title and actions.
```scss
.notification-popup__header {
    border-bottom: 1px solid #ddd;
    &-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 6px 12px;
    }
    &-heading {
        font-size: 18px;
        font-weight: 600;
    }
}
```

### Active Filters (`notification-popup__active-filter-list`)
Filter options for different notification categories.
```scss
.notification-popup__active-filter-list {
    display: flex;
    align-items: center;
    &-item {
        padding: 6px 12px;
        cursor: pointer;
    }
    &-item-text--badge {
        font-weight: 500;
    }
}
```

### Footer (`notification-popup__footer`)
Contains action buttons at the bottom.
```scss
.notification-popup__footer {
    display: flex;
    justify-content: space-between;
    padding: 10px;
    &-action-list-item {
        display: flex;
        align-items: center;
        justify-content: center;
    }
}
```

## UI/UX Considerations

- **Consistency:** Colors, spacing, and typography follow a predefined style guide.
- **Accessibility:** Components are built with semantic HTML and proper contrast for readability.
- **Responsiveness:** Designed to work across different screen sizes.
- **Scalability:** BEM ensures that styles remain manageable as the project grows.

## How to Run Locally

1. Clone the repository:
   ```sh
   git clone https://github.com/yourusername/project-management-components.git
   ```
2. Navigate to the project folder:
   ```sh
   cd project-management-components
   ```
3. Open `index.html` in a browser to view the components.

## Contribution

This repository serves as a demonstration of front-end best practices, but if you'd like to contribute, feel free to fork the repo and submit a pull request with improvements.

## License

This project is open-source and available under the MIT License.

