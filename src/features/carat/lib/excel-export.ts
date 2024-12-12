import { Workbook } from 'exceljs';


/**
 * Экспорт каротажа в Excel. Excel содержит один лист, в верхнем левом углу
 * которого расположена картинка с видимой частью активного трека.
 * @return файл в бинарном виде
 */
export function caratToExcel(canvas: HTMLCanvasElement, wellName: string): Promise<Blob> {
  const { promise, resolve, reject } = Promise.withResolvers<Blob>();

  const cb = (data: Blob) => {
    if (!data) reject();
    const imageSize = {width: canvas.width , height: canvas.height };
    resolve(createExcel(data, imageSize, wellName));
  };

  canvas.toBlob(cb, 'image/png', 1);
  return promise;
}

async function createExcel(image: Blob, size: {width: number, height: number}, well: string): Promise<Blob> {
  const workbook = new Workbook();
  const sheet = workbook.addWorksheet('Каротаж ' + well);

  const imageBuffer = await image.arrayBuffer();
  const imageID = workbook.addImage({buffer: imageBuffer, extension: 'png'});
  sheet.addImage(imageID, {tl: {col: 0, row: 0}, ext: size});

  const fileBuffer = await workbook.xlsx.writeBuffer();
  return new Blob([fileBuffer]);
}
