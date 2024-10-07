import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'fs';


/** Создаёт в папке с билдом подпапку с системами. */
export default function wellManagerSystemPlugin(command) {
  let hasError = false;
  const htmlFileName = 'index.html';

  return {
    name: 'wellManagerSystemPlugin',

    buildEnd(error) {
      if (error) hasError = true;
    },
    closeBundle(){
      if (hasError || command !== 'build') return;
      const inputFile = './build/' + htmlFileName;
      let htmlSource = readFileSync(inputFile, {encoding: 'utf-8'});
      htmlSource = htmlSource.replaceAll('="./', '="../../');

      const systemDirectoryPath = './build/systems';
      try {
        mkdirSync(systemDirectoryPath);
      } catch (e) {
        if (e.code !== 'EEXIST') console.log(e.message);
      }
      const existingDirectories = readdirSync(systemDirectoryPath);
      const systems = ['ADMIN_SYSTEM', 'JS_WMW_DEMO', 'GRP_SYSTEM', 'KERN_SYSTEM', 'PREPARE_SYSTEM'];

      for (const systemID of systems) {
        const systemPath = systemDirectoryPath + '/' + systemID;
        if (!existingDirectories.includes(systemID)) mkdirSync(systemPath);
        writeFileSync(systemPath + '/' + htmlFileName, htmlSource);
      }
    },
  };
}
