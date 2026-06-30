import Hotspots from "../../../../../../FormatD.HotspotEditor/Resources/Private/Scripts/HotspotEditorFrontend/Hotspots"

/**
 * Content With Hotspots logic
 * When using your own bundling, you may extend this class and customize.
 * All protected methods can be overridden. See README for further details.
 */
export default class ContentWithHotspots {

	protected hotspotsMap: Map<HTMLElement, Hotspots> = new Map();
	private activeClickHandler: EventListener | null = null;
	private layerPortals: Map<string, { layer: HTMLElement; portalWrapper: HTMLElement; originalParent: HTMLElement }> = new Map();

	protected get isBackend(): boolean {
		return document.body.classList.contains('neos-backend');
	}

	protected getLayer(hotspotId: string, container: HTMLElement): HTMLElement | null {
		return this.layerPortals.get(hotspotId)?.layer
			?? container.querySelector<HTMLElement>('.hotspot-with-layer--layer[data-hotspot-id="' + hotspotId + '"]');
	}

	getDraggableHotspotsNodeTypes(domSection: HTMLElement): string[] {
		const baseType = 'FormatD.HotspotEditor:Content.Hotspot';
		const attr = domSection.dataset.hotspotNodeTypes;
		const extraTypes = attr ? attr.split(',').filter(Boolean) : [];
		return [baseType, ...extraTypes];
	}

	createDraggableHotspots(domSection: HTMLElement) {
		return new Hotspots(domSection, this.getDraggableHotspotsNodeTypes(domSection));
	}

	initialize(domSection: HTMLElement) {
		this.dispose();
		this.initializeBackend(domSection)
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

	protected closeOtherShowroomHotspots(hotspotArea: HTMLElement, excludeHotspotId: string | null = null) {
		const inDomLayers = this.getLayersForHotspotArea(hotspotArea);
		const portaledLayers = Array.from(this.layerPortals.values()).map(e => e.layer);
		[...inDomLayers, ...portaledLayers].forEach((layer) => {
			const layerHotspotId = layer.dataset.hotspotId;
			if (!layerHotspotId || layerHotspotId === excludeHotspotId) return;
			if (!layer.classList.contains('layer-open')) return;
			this.deactivateHotspot(layerHotspotId, hotspotArea);
		});
	}

	initializeFrontend(domSection: HTMLElement, hotspotAreas: NodeListOf<HTMLElement>) {
		hotspotAreas.forEach((hotspotArea) => {
			this.initializeHotspotArea(hotspotArea)
		});
	}

	getLayersForHotspotArea(hotspotArea: HTMLElement) {
		return Array.from<HTMLElement>(hotspotArea.querySelectorAll('.hotspot-with-layer--layer'));
	}

	initializeHotspotArea(hotspotArea: HTMLElement) {
		const layers = this.getLayersForHotspotArea(hotspotArea)
		layers.forEach((layer) => {
			this.initializeLayer(hotspotArea, layer)
		});
		if (layers.length > 0) {
			this.handleClickOutsideShowroomLayer(hotspotArea, layers);
			if (this.isBackend) {
				hotspotArea.classList.add('has-closed-layer');
			}
		}
	}

	initializeLayer(hotspotArea: HTMLElement, layer: HTMLElement) {
		const hotspotId = layer.dataset.hotspotId;
 		if (!hotspotId) return null;

		if (!layer.id) {
			layer.id = hotspotId;
		}

		const closeButton = layer.querySelector<HTMLElement>('.hotspot-with-layer--layer-close');
		closeButton?.addEventListener('click', () => {
			this.deactivateHotspot(hotspotId, hotspotArea);
		});

		const hotspot = hotspotArea.querySelector<HTMLElement>('.hotspot[data-hotspot-id="' + hotspotId + '"]');
		if (!hotspot) return null;

		const hotspotLabel = hotspot.getAttribute('aria-label');
		if (hotspotLabel && !layer.hasAttribute('aria-label') && !layer.hasAttribute('aria-labelledby')) {
			layer.setAttribute('aria-label', hotspotLabel);
		}

		hotspot.setAttribute('aria-expanded', 'false');

		layer.addEventListener('keydown', (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				event.preventDefault();
				this.deactivateHotspot(hotspotId, hotspotArea);
			}
		});

		layer.addEventListener('keydown', (event: KeyboardEvent) => {
			if (event.key !== 'Tab') return;
			const focusable = Array.from(layer.querySelectorAll<HTMLElement>(
				'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
			)).filter(el => !el.closest('[hidden]'));
			if (!focusable.length) return;
			const first = focusable[0];
			const last = focusable[focusable.length - 1];
			if (event.shiftKey && document.activeElement === first) {
				event.preventDefault();
				last.focus();
			} else if (!event.shiftKey && document.activeElement === last) {
				event.preventDefault();
				first.focus();
			}
		});

		hotspot.addEventListener(this.isBackend ? 'contextmenu' : 'click', (event) => {
			event.preventDefault();
			event.stopPropagation();
			this.activateHotspot(hotspotId, hotspotArea);
		});

		if (this.isBackend) {
			hotspot.addEventListener('click', (event) => {
				event.stopPropagation();
			});
		}

		return hotspot;
	}

	activateHotspot(hotspotId: string, container: HTMLElement) {
		const hotspotInstance = this.hotspotsMap.get(container);
		if (hotspotInstance) {
			hotspotInstance.setEditable(false);
		}

		this.closeOtherShowroomHotspots(container, hotspotId);

		const layer = this.getLayer(hotspotId, container);
		if (!layer) return;

		if (!this.isBackend && !this.layerPortals.has(hotspotId)) {
			const originalParent = layer.parentElement!;
			const portalWrapper = this.createPortalWrapper();
			portalWrapper.appendChild(layer);
			document.body.appendChild(portalWrapper);
			this.layerPortals.set(hotspotId, { layer, portalWrapper, originalParent });
		}

		this.onBeforeLayerShown(layer, container);

		layer.hidden = false;
		layer.classList.add('layer-open');
		if (this.isBackend) {
			container.classList.remove('has-closed-layer');
		}

		const hotspot = container.querySelector<HTMLElement>('.hotspot[data-hotspot-id="' + hotspotId + '"]');
		hotspot?.setAttribute('aria-expanded', 'true');

		const closeButton = layer.querySelector<HTMLElement>('.hotspot-with-layer--layer-close');
		requestAnimationFrame(() => {
			(closeButton ?? layer).focus();
		});

		this.toggleHotspotsVisibility(hotspotId, container);
		this.onLayerDidOpen(layer, hotspot, container);

		if (this.isBackend && hotspotInstance) {
			hotspotInstance.onExternalNodeSelected = (element) => {
				const activeHotspot = container.querySelector<HTMLElement>('.hotspot[data-hotspot-id="' + hotspotId + '"]');
				const activeHotspotNodeWrapper = activeHotspot?.closest('[data-__neos-node-contextpath]');
				if (element && (element === activeHotspotNodeWrapper || layer.contains(element))) return;
				this.deactivateHotspot(hotspotId, container);
			};
		}
	}

	deactivateHotspot(hotspotId: string, container: HTMLElement) {
		const layer = this.getLayer(hotspotId, container);
		if (!layer) return;
		layer.classList.remove('layer-open');

		const finish = () => {
			layer.hidden = true;

			if (!this.isBackend) {
				const portalEntry = this.layerPortals.get(hotspotId);
				if (portalEntry) {
					portalEntry.originalParent.appendChild(layer);
					portalEntry.portalWrapper.remove();
					this.layerPortals.delete(hotspotId);
				}
			}

			if (this.isBackend) {
				container.classList.add('has-closed-layer');
				const hotspotInstance = this.hotspotsMap.get(container);
				if (hotspotInstance) {
					hotspotInstance.onExternalNodeSelected = null;
				}
			}

			const hotspot = container.querySelector<HTMLElement>('.hotspot[data-hotspot-id="' + hotspotId + '"]');
			hotspot?.setAttribute('aria-expanded', 'false');
			hotspot?.focus();

			const hotspotInstance = this.hotspotsMap.get(container);
			if (hotspotInstance) {
				hotspotInstance.setEditable(true);
			}

			this.toggleHotspotsVisibility(hotspotId, container);
			this.onLayerDidClose(layer, hotspot, container);
		};

		if (this.isBackend) {
			finish();
		} else {
			this.onBeforeLayerHidden(layer, finish);
		}
	}

	public dispose(): void {
		if (this.activeClickHandler) {
			document.removeEventListener('click', this.activeClickHandler);
			this.activeClickHandler = null;
		}
		this.hotspotsMap.forEach((hotspotInstance) => {
			hotspotInstance.onExternalNodeSelected = null;
			hotspotInstance.dispose();
		});
		this.hotspotsMap.clear();
		this.layerPortals.forEach(({ layer, portalWrapper, originalParent }) => {
			originalParent.appendChild(layer);
			portalWrapper.remove();
		});
		this.layerPortals.clear();
	}

	handleClickOutsideShowroomLayer(container: HTMLElement, layers: HTMLElement[]) {
		if (this.isBackend) {
			return;
		}

		this.activeClickHandler = (event: Event) => {
			for (const layer of layers) {
				if (!layer.classList.contains('layer-open') || layer.contains(event.target as Node)) {
					continue;
				}
				const hotspotId = layer.dataset.hotspotId;
				if (!hotspotId) continue;
				const hotspot = container.querySelector<HTMLElement>('.hotspot[data-hotspot-id="' + hotspotId + '"]');
				if (hotspot?.contains(event.target as Node)) {
					continue;
				}
				this.deactivateHotspot(hotspotId, container);
			}
		};
		document.addEventListener('click', this.activeClickHandler);
	}

	toggleHotspotsVisibility(hotspotId: string, container: HTMLElement) {
		const activeLayer = this.getLayer(hotspotId, container);
		const isActive = !(activeLayer?.hidden ?? true);
		container.querySelectorAll<HTMLElement>('.hotspot').forEach(hotSpot => {
			if (!isActive || hotSpot.dataset.hotspotId === hotspotId) {
				hotSpot.classList.remove('hidden');
			} else {
				hotSpot.classList.add('hidden');
			}
		});
	}

	protected createPortalWrapper(): HTMLElement {
		const wrapper = document.createElement('div');
		wrapper.className = 'content-with-hotspots hotspot-layer-portal';
		return wrapper;
	}

	protected onBeforeLayerShown(layer: HTMLElement, container: HTMLElement): void {}

	protected onLayerDidOpen(layer: HTMLElement, hotspot: HTMLElement | null, container: HTMLElement): void {}

	protected onBeforeLayerHidden(layer: HTMLElement, finish: () => void): void {
		finish();
	}

	protected onLayerDidClose(layer: HTMLElement, hotspot: HTMLElement | null, container: HTMLElement): void {}
}
