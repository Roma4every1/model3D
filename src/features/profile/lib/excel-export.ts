import { Workbook } from 'exceljs';


export function profileToExcel(canvas: HTMLCanvasElement): Promise<Blob> {
  const { promise, resolve, reject } = Promise.withResolvers<Blob>();

  const cb = (data: Blob) => {
    if (!data) reject();
    resolve(createExcel(data, canvas.width, canvas.height));
  };
  canvas.toBlob(cb, 'image/png', 1);
  return promise;
}

async function createExcel(image: Blob, width: number, height: number): Promise<Blob> {
  const workbook = new Workbook();
  const sheet = workbook.addWorksheet('Профиль');

  const imageBuffer = await image.arrayBuffer();
  const imageID = workbook.addImage({buffer: imageBuffer, extension: 'png'});
  sheet.addImage(imageID, {tl: {col: 0, row: 0}, ext: {width, height}});

  const fileBuffer = await workbook.xlsx.writeBuffer();
  return new Blob([fileBuffer]);
}
