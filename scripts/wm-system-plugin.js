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
      const systems = [
        'ADMIN_SYSTEM', 'ADMIN_SYSTEM_PGS', 'DEMO', 'GRP_SYSTEM', 'GRP_SYSTEM_PGS',
        'KERN_SYSTEM', 'KERN_SYSTEM_PGS', 'NEF_SYSTEM', 'NEF_SYSTEM_PGS',
        'PREPARE_SYSTEM', 'PREPARE_SYSTEM_PGS',
      ];
      const existingDirectories = readdirSync(systemDirectoryPath);

      for (const systemID of systems) {
        const systemPath = systemDirectoryPath + '/' + systemID;
        if (!existingDirectories.includes(systemID)) mkdirSync(systemPath);
        writeFileSync(systemPath + '/' + htmlFileName, htmlSource);
      }
    },
  };
}
