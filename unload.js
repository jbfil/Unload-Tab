var MENU_ID = 'unload-tab';
var APP_NAME = 'Unload Tab';

function unloadTab(item, tab) {
	// Can't unload active tab.
	if(tab.active) {
		return browser.windows.get(tab.windowId, {populate: true}).then(window => {
			console.log(APP_NAME, 'Tab is Active', window);
			function adjust(index) {
				return index < tab.index ? index + window.tabs.length : index;
			}

			var tabs = window.tabs;
			var dis = tabs
				// Filter discarded tabs and current tab.
				.filter(cur => !cur.discarded && cur.id != tab.id);
			var active = dis
				// Pick next active window from ring relative to tab
				.reduce((acc, cur) => {
					if(acc === undefined) return cur;
					return adjust(cur.index) < adjust(acc.index) ? cur : acc;
				});

			return active
				// Set the next tab to active
				? browser.tabs.update(active.id, {active: true})
				// Create a new tab if all are disabled. Set it active.
				: browser.tabs.create({active: true, index: tab.index + 1});
				//: browser.tabs.create({active: true, index: window.tabs.length});
		}, console.error).then(() => browser.tabs.discard(tab.id));
	} else {
		return browser.tabs.discard(tab.id);
	}
}

// Add new entry to context menu for browser tabs.
browser.menus.create({
	id: MENU_ID,
	type: 'normal',
	title: 'Unload Tab',
	enabled: true,
	contexts: ['tab'],
	icons: null,
	// documentUrlPatterns: [],
	// targetUrlPatterns: [],
	onclick: unloadTab,
}, () => {
	if (browser.runtime.lastError) {
		console.error('Unload Tab: Error creating menu item. ' + browser.runtime.lastError);
	}
});

// Show/Hide entry based on unloaded state of tab
browser.menus.onShown.addListener(function(item, tab) {

	// Update menu with status of tab
	browser.menus.update(MENU_ID, {
		enabled: !tab.discarded,
		visible: !(tab.url && tab.url.startsWith('about:')),
	});

	// Refresh menu to show changes
	browser.menus.refresh();
});



browser.menus.onClicked.addListener(function(info, tab) {
	return;
	if (info.menuItemId == MENU_ID) {
		browser.tabs.get(tab.id)
		.then(function(tab_info) {
			if (tab_info.discarded) {
				console.log('Unload Tab: Already unloaded');
				throw null;
			}
			if (tab_info.active) {
				// Search for other tabs in current window
				return browser.tabs.query({currentWindow: true})
				.then(tabs => {
					if (tabs.length > 1) {
						tabs = tabs.sort((a,b) => a.index - b.index);
						for(var i = tab.index + 1; i < tab.index + tabs.length; ++i) {
							var idx = i % tabs.length;
							if(tabs[idx].discarded === false) {
								// Set found non-discarded tab as active
								return browser.tabs.update(tabs[idx].id, {active: true});
							}
						}
					}

					// No non-discarded tabs in this window. Open new tab
					return browser.tabs.create({
						active: true,
						//url: "about:newtab",
					})
				})
				// Make another tab 'active'
				.then(tab => browser.tabs.update(tab.id, {active: true}));
			}
		})
		// It's not possible to discard the currently active tab, or a tab
		// whose document contains a beforeunload listener that would display
		// a prompt
		.then(() => browser.tabs.discard(tab.id))
		.then(function() {
			console.log(`Unload Tab: Unloaded ${tab.id}`);
		})
		.catch(function(error) {
			console.log(`Unload Tab: Failed unload. ${error}`);
		});
	}
});
