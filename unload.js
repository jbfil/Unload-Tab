var MENU_ID = 'unload-tab';

var options = {
	'new-tab-placement': 'after',
};

function option(item, values) {
	return values[options[item]];
}

browser.storage.sync.get()
	.then(values => {
		Object.assign(options, values);
		if(Object.entries(values).length === 0) {
			return browser.storage.sync.set(options);
		}
	})
	.catch(console.error)
	.finally(() => browser.storage.onChanged.addListener((changes, area) => {
		Object.keys(changes).forEach(key => {
			options[key] = changes[key].newValue;
			console.log('storage', area, 'change', key, changes[key]);
		})
	}));

function unloadTab(item, tab) {
	// Can't unload active tab.
	if(tab.active) {
		return browser.windows.get(tab.windowId, {populate: true}).then(window => {
			// adjust reframes index to be relative to tab
			function adjust(index) {
				return index < tab.index ? index + window.tabs.length : index;
			}

			var active = window.tabs
				// Filter discarded tabs and current tab.
				.filter(cur => !cur.discarded && cur.id != tab.id)
				// Pick next active window from ring relative to tab
				.reduce((acc, cur) => {
					if(acc === undefined) return cur;
					return adjust(cur.index) < adjust(acc.index) ? cur : acc;
				}, undefined);

			return active
				// Set the next tab to active
				? browser.tabs.update(active.id, {active: true})
				// Create a new tab if all are disabled. Set it active.
				: browser.tabs.create({
					active: true,
					index: option('new-tab-placement', {after: tab.index + 1, last: window.tabs.length}),
				});
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
