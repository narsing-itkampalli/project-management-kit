<?php

$database__tasks = json_decode(file_get_contents('database/tasks.json'), true);

?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Time Tracker</title>
    <link rel="stylesheet" href="/asset/style.css">
</head>
<body>
    <div class="timetracker">
        <div class="timetracker__container">
            <div class="timetracker__section">
                <div class="timetracker__section-header">
                    <div class="timetracker__section-header-container">
                        <button type="button" class="timetracker__section-header-reorder">
                            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="7.000000476837158 3 10 17" x--name="fluent--re-order-dots-vertical-24-regular"><path fill="currentColor" d="M15.5 17a1.5 1.5 0 1 1 0 3a1.5 1.5 0 0 1 0-3m-7 0a1.5 1.5 0 1 1 0 3a1.5 1.5 0 0 1 0-3m7-7a1.5 1.5 0 1 1 0 3a1.5 1.5 0 0 1 0-3m-7 0a1.5 1.5 0 1 1 0 3a1.5 1.5 0 0 1 0-3m7-7a1.5 1.5 0 1 1 0 3a1.5 1.5 0 0 1 0-3m-7 0a1.5 1.5 0 1 1 0 3a1.5 1.5 0 0 1 0-3"></path></svg>
                        </button>
                        <button type="button" class="timetracker__section-header-toggle">
                            <span class="timetracker__section-header-toggle-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="10 7 5 10" x--name="material-symbols-arrow-right"><path fill="currentColor" d="M10 17V7l5 5z"></path></svg>
                            </span>
                        </button>
                        <div class="timetracker__section-header-title">
                            <!-- <input type="text" value="Authenticated" class="timetracker__section-header-title-input"> -->
                            <div class="timetracker__section-header-title-text">Authenticated</div>
                        </div>
                        <div class="timetracker__section-header-action-list">
                            <button type="button" class="timetracker__section-header-action-list-item">
                                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="3 3.9996166229248047 18 16.000383377075195" x--name="mdi-rename-outline"><path fill="currentColor" d="m15 16l-4 4h10v-4zm-2.94-8.81L3 16.25V20h3.75l9.06-9.06zM5.92 18H5v-.92L12.06 10l.94.94zm12.79-9.96c.39-.39.39-1.04 0-1.41l-2.34-2.34a1.001 1.001 0 0 0-1.41 0l-1.83 1.83l3.75 3.75z"></path></svg>
                            </button>
                            <button type="button" class="timetracker__section-header-action-list-item">
                                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="4 3 16.000003814697266 18.000001907348633" x--name="material-symbols-delete-outline-rounded"><path fill="currentColor" d="M7 21q-.825 0-1.412-.587T5 19V6q-.425 0-.712-.288T4 5q0-.425.288-.712T5 4h4q0-.425.288-.712T10 3h4q.425 0 .713.288T15 4h4q.425 0 .713.288T20 5q0 .425-.288.713T19 6v13q0 .825-.587 1.413T17 21zM17 6H7v13h10zm-7 11q.425 0 .713-.288T11 16V9q0-.425-.288-.712T10 8q-.425 0-.712.288T9 9v7q0 .425.288.713T10 17m4 0q.425 0 .713-.288T15 16V9q0-.425-.288-.712T14 8q-.425 0-.712.288T13 9v7q0 .425.288.713T14 17M7 6v13z"></path></svg>
                            </button>
                            <button type="button" class="timetracker__section-header-action-list-item">
                                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="5 5 14 14" x--name="bx--plus"><path fill="currentColor" d="M19 11h-6V5h-2v6H5v2h6v6h2v-6h6z"></path></svg>
                            </button>
                        </div>
                    </div>
                </div>
                <div class="timetracker__section-body">
                    <div class="timetracker__section-body-container">
                        <div class="timetracker__task-list">
                            <div class="timetracker__task-list-item">
                                
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="list">
            <div class="item">
                <h2 class="title">Notifications window</h2>
            </div>
            <div class="sublist">
                <div class="item">
                    <div class="title"></div>
                </div>
            </div>
        </div>
    </div>
    <script src="/asset/index.js" type="module"></script>
</body>
</html>