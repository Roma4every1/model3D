import { once } from "lodash";


export default once( () => {
	// в браузере 1cm = 96px / 2.54
	return 100 * 96 / 2.54;

	// const div = document.createElement('div');
	// const sampleSizeInCm = 100000;
	//
	// div.style.width = div.style.height = sampleSizeInCm + 'cm';
	// div.style.position = 'fixed';
	// document.body.appendChild(div);
	//
	// try {
	// 	return div.clientWidth * (100 / sampleSizeInCm);
	// }
	//
	// finally {
	// 	document.body.removeChild(div);
	// }
});
