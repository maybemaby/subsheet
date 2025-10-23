import type { Attachment } from 'svelte/attachments';
import { animate, type AnimationParams } from 'animejs';

export const animeAttach: (params: AnimationParams) => Attachment = (params) => {
	return (el) => {
		animate(el, params);
	};
};
