import { once } from "lodash";


export default once( () => {
	const div = document.createElement('div');
	// размер "образца" в см
	const sampleSizeInCm = 20;

	div.style.width = div.style.height = sampleSizeInCm + 'cm';
	div.style.position = 'fixed';
	document.body.appendChild(div);

	try {
		return div.clientWidth * (100 / sampleSizeInCm);
	}
	finally {
		document.body.removeChild(div);
	}
});
