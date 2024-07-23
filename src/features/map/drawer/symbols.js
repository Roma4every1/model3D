/** @param def {string} */
export function def2json(def) {
  return def
    .split('\n')
    .map((str) => str.trim())
    .filter(Boolean)
    .filter((str) => str.charAt(0) !== ';')
    .map((str) => str.match(/^\[\s*(\/)?\s*(.*?)(?:\s*=\s*(.*?))?]$|^(.*?)\s*=\s*(.*?)$/))
    .filter(Boolean)
    .reduce(function (stack, parsed) {
      if (parsed[1] != null) {
        let name = parsed[2]
        while (stack.length > 1) {
          if (stack.pop().name === name) break;
        }
      } else if (parsed[2] != null) {
        let name = parsed[2];
        var ret = {};
        if (parsed[3] != null) ret.$ = mayBeNumber(parsed[3]);
        stack[stack.length - 1].value[name] = ret;
        stack.push({name, value: ret});
      } else if (parsed[4] != null) {
        let name = parsed[4];
        stack[stack.length - 1].value[name] = mayBeNumber(parsed[5]);
      }
      return stack;
    }, [{value: {}}])[0].value;
}

/** @param str {string} */
function mayBeNumber(str) {
	const n = Number(str);
  return Number.isNaN(n) ? str : n;
}
