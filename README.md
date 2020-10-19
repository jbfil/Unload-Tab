
# ![Unload Tab Icon](border-48.png) Unload Tab - [Firefox Addon]

Unload Tab from context menu to free up system resources. Really it is just to satisfy all of you with OCD. :wink:

Right click menu on tab will have an option to 'Unload Tab'. This will be disabled for tabs which are already unloaded. Pages 'about:\*' will not have the context menu shown as they can't be unloaded.

## Todo
- Reload options on change.
- Support for multiple tabs selected.

## Changes

### Version 1.2.0

- Added option to add to page context menu.


### Version 1.1.0

- Menu item will disable if the tab is already unloaded.
- Menu item will not be displayed for 'about:*' pages as they don't unload.
- Added an options page.
	- Added option new-tab-placement. Determines where to create new tab if all tabs in window are unloaded.
- Storage of options.

### Version 1.0.1

Fixed unloading last tab. When last tab or only tab gets unloaded a newtab page opens.

### Version 1.0.0

Context menu on tab has option to unload the current tab. Switches to next loaded tab or creates a new tab.

[Firefox Addon]: https://addons.mozilla.org/en-US/firefox/addon/unload-tab-from-context-menu/
