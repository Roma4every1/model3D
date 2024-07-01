import systemDict from './systems.json';
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'fs';


/** Создаёт в папке с билдом подпапку с системами. */
export default function wellManagerSystemPlugin(command, systemSetID = 'all') {
  let hasError = false;
  const fileName = 'index.html';
  const outDir = './build/';

  return {
    name: 'wellManagerSystemPlugin',

    buildEnd(error) {
      if (error) hasError = true;
    },
    closeBundle(){
      if (hasError || command !== 'build') return;
      let systems = [];

      if (systemSetID === 'all') {
        const all = new Set();
        for (const id in systemDict) {
          for (const systemID of systemDict[id]) {
            all.add(systemID);
          }
        }
        all.forEach(id => systems.push(id));
        systems.sort();
      } else {
        systems = systemDict[systemSetID];
      }
      if (!systems || systems.length === 0) {
        console.log(`No systems for "${systemSetID})"`);
        return;
      }

      const inputFile = outDir + fileName;
      let htmlSource = readFileSync(inputFile, {encoding: 'utf-8'});
      htmlSource = htmlSource.replaceAll('="./', '="../../');

      const systemDirectoryPath = outDir + 'systems';
      try {
        mkdirSync(systemDirectoryPath);
      } catch (e) {
        if (e.code !== 'EEXIST') console.log(e.message);
      }

      const existingDirectories = readdirSync(systemDirectoryPath);
      for (const systemID of systems) {
        const systemPath = systemDirectoryPath + '/' + systemID;
        if (!existingDirectories.includes(systemID)) mkdirSync(systemPath);
        writeFileSync(systemPath + '/' + fileName, htmlSource);
      }
    },
  };
}
