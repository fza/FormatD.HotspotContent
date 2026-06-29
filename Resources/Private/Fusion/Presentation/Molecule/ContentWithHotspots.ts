import '../../Overrides/FormatD.HotspotEditor/Presentation/Atom/Hotspot.scss';
import '../../Overrides/FormatD.HotspotEditor/Presentation/Molecule/ContentWithHotspots.scss';
import '../../Integration/HotspotLayer.scss';

import Hotspots from "../../../../../../FormatD.HotspotEditor/Resources/Private/Scripts/HotspotEditorFrontend/Hotspots"

export default class ContentWithHotspots {

	protected hotspotsMap: Map<HTMLElement, Hotspots> = new Map();
	private activeClickHandler: EventListener | null = null;

	private get isBackend(): boolean {
		return document.querySelector('body')?.classList.contains('neos-backend') ?? false;
	}

	getDraggableHotspotsNodeTypes(domSection: HTMLElement): string[] {
		return ['FormatD.HotspotEditor:Content.Hotspot', 'FormatD.HotspotContent:Content.HotspotWithLayer']
	}

	createDraggableHotspots(domSection: HTMLElement) {
		return new Hotspots(domSection, this.getDraggableHotspotsNodeTypes(domSection));
	}

	initialize(domSection: HTMLElement) {
		this.dispose();
		// init backend
		this.initializeBackend(domSection)
		// init frontend
		const hotspotAreas = <NodeListOf<HTMLElement>>domSection.querySelectorAll('.content-with-hotspots');
		if (hotspotAreas.length < 1) return;

		this.initializeFrontend(domSection, hotspotAreas)
	}

	initializeBackend(domSection: HTMLElement) {
		const hotspotAreas = <NodeListOf<HTMLElement>>domSection.querySelectorAll('.content-with-hotspots');
		hotspotAreas.forEach((hotspotArea) => {
			if (!this.hotspotsMap.has(hotspotArea)) {
				this.hotspotsMap.set(hotspotArea, this.createDraggableHotspots(hotspotArea));
			}
		});
	}

	initializeFrontend(domSection: HTMLElement, hotspotAreas: NodeListOf<HTMLElement>) {
		hotspotAreas.forEach((hotspotArea) => {
			this.initializeHotspotArea(hotspotArea)
		});
	}

	getLayersForHotspotArea(hotspotArea: HTMLElement) {
		return Array.from<HTMLElement>(hotspotArea.querySelectorAll('.hotspot-with-layer--layer'))
	}

	initializeHotspotArea(hotspotArea: HTMLElement) {
		const layers = this.getLayersForHotspotArea(hotspotArea)
		layers.forEach((layer) => {
			this.initializeLayer(hotspotArea, layer)
		});
		if (layers.length > 0) {
			this.handleClickOutsideShowroomLayer(hotspotArea, layers);
		}
	}

	initializeLayer(hotspotArea: HTMLElement, layer: HTMLElement) {
		const hotspotId = layer.dataset.hotspotId;
		if (!hotspotId) {
			return null;
		}

		const closeButton = layer.querySelector('.hotspot-with-layer--layer-close');
		closeButton?.addEventListener('click', () => {
			this.deactivateHotspot(hotspotId, hotspotArea);
		});

		const hotspot = hotspotArea.querySelector<HTMLElement>('.hotspot[data-hotspot-id="' + hotspotId + '"]');
		if (!hotspot) {
			return null;
		}

		hotspot.addEventListener(this.isBackend ? 'contextmenu' : 'click', (event) => {
			event.preventDefault();
			this.activateHotspot(hotspotId, hotspotArea);
		});

		return hotspot;
	}

	activateHotspot(hotspotId: string, container: HTMLElement) {
		const hotspotInstance = this.hotspotsMap.get(container);
		if (hotspotInstance) {
			hotspotInstance.setEditable(false);
		}

		const layer = container.querySelector('.hotspot-with-layer--layer[data-hotspot-id="' + hotspotId + '"]');
		if (!layer) return;
		layer.classList.toggle('js--active');
		this.toggleHotspotsVisibility(hotspotId, container);
	}

	deactivateHotspot(hotspotId: string, container: HTMLElement) {
		const layer = container.querySelector('.hotspot-with-layer--layer[data-hotspot-id="' + hotspotId + '"]');
		if (!layer) return;
		layer.classList.toggle('js--active');

		const hotspotInstance = this.hotspotsMap.get(container);
		if (hotspotInstance) {
			hotspotInstance.setEditable(true);
		}
		this.toggleHotspotsVisibility(hotspotId, container);
	}

	public dispose(): void {
		if (this.activeClickHandler) {
			document.removeEventListener('click', this.activeClickHandler);
			this.activeClickHandler = null;
		}
		this.hotspotsMap.forEach((hotspotInstance) => {
			hotspotInstance.dispose();
		});
		this.hotspotsMap.clear();
	}

	handleClickOutsideShowroomLayer(container: HTMLElement, layers: HTMLElement[]) {
		if (this.isBackend) {
			return;
		}

		this.activeClickHandler = (event: Event) => {
			for (const layer of layers) {
				if (!layer.classList.contains('js--active') || !layer.contains(event.target as Node)) {
					continue;
				}
				const hotspotId = layer.dataset.hotspotId;
				if (hotspotId && event.target instanceof HTMLElement && event.target.closest('.hotspot') === null) {
					this.deactivateHotspot(hotspotId, container);
				}
			}
		};
		document.addEventListener('click', this.activeClickHandler);
	}

	toggleHotspotsVisibility(hotspotId: string, container: HTMLElement) {
		const hotSpots = container.querySelectorAll('.hotspot');
		const layer = container.querySelector('.hotspot-with-layer--layer[data-hotspot-id]') as HTMLElement | null;
		if (!layer) return;
		const activeHotspotId = layer.dataset.hotspotId;
		hotSpots.forEach(hotSpot => {
			const hotspotElement = hotSpot as HTMLElement;
			if (hotspotElement.dataset.hotspotId === activeHotspotId) {
				hotSpot.classList.remove('hidden');
			} else {
				hotSpot.classList.add('hidden');
			}
		});
	}
}
