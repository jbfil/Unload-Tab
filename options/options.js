
function blurOnEnter(evt) {
	if(evt.charCode === 13) {
		evt.target.blur();
		return false;
	}
}

document.addEventListener('DOMContentLoaded', function() {
	document.querySelectorAll('select, input').forEach(elm => {
		if(elm.tagName === 'INPUT' && elm.type === 'text') {
			elm.addEventListener('keydown', blurOnEnter);
			elm.addEventListener('blur', console.log);
			elm.addEventListener('change', console.log);
		}

		browser.storage.sync.get(elm.name)
			.then(res => {
				elm.value = res[elm.name] || "";
				console.log("get", elm.name, elm.value);
				return res;
			})
			//.then((res) => console.log('storage * get', res), console.error);

		elm.addEventListener('change', evt => {
			console.log('Change', elm.name, elm.value);
			var values = {};
			values[elm.name] = elm.value;
			browser.storage.sync.set(values)
				.then(function() {
					console.log("set", values);
				});
				//.then(() => console.log('storage sync set', values), console.error);
		});
	});
});
