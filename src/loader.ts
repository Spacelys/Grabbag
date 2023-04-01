/* eslint-disable arrow-body-style */
export const loadImage = (url: string): Promise<HTMLImageElement> => {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.onload = () => resolve(img);
		img.onerror = () => {
			reject(new Error('Could not load image at ' + url));
		};
		img.src = url;
		return img;
	});
};
