
// Add Unload Tab option to context menu

browser.menus.create({
	id: 'unload-tab',
	type: 'normal',
	title: 'Unload Tab',
	contexts: ['tab'],
}, function() {
	if (browser.runtime.lastError) {
		console.log('Unload Tab: Error creating menu item. ' + browser.runtime.lastError);
	}
});

browser.menus.onClicked.addListener(function(info, tab) {
	if (info.menuItemId == "unload-tab") {
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
					console.log('Unload Tab: ', tabs);
					if (tabs.length == 1) {
						throw new Error('Unable to unload only tab in window.');
					}
					tabs = tabs.sort((a,b) => a.index - b.index);
					return tabs[(tabs.find((cur, i) => cur.id == tab.id).index + 1) % tabs.length];
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
