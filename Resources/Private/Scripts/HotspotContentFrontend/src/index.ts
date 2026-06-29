import ContentWithHotspots from '../../../Fusion/Presentation/Molecule/ContentWithHotspots';

function isNeosBackend(): boolean {
	return document.querySelector('body')?.classList.contains('neos-backend') ?? false;
}

function boot(): void {
	const controller = new ContentWithHotspots();
	controller.initialize(document.documentElement);

	if (!isNeosBackend()) {
		return;
	}

	let scheduled = false;
	const observer = new MutationObserver(() => {
		if (scheduled) {
			return;
		}
		scheduled = true;
		window.setTimeout(() => {
			scheduled = false;
			controller.initialize(document.documentElement);
		}, 200);
	});
	observer.observe(document.body, {childList: true, subtree: true});
}

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', boot);
} else {
	boot();
}
