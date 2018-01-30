
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
