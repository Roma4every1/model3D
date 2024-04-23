import { inflate, deflate } from 'pako';
import { readXml } from '../drawer/gs-transform';


/** Сериализация и десереализация контейнеров карты. */
export class MapContainerConverter {
  constructor(private readonly key: Uint8Array) {}

  /** Обработка контейнера карты. */
  public parse(container): ParsedContainer {
    const containerXML = this.decode(container);
    return readXml(containerXML);
  }

  /** Кодирует строку в массив байт, проводя следующие преобразования:
   * 1. UTF-8 string -> Uint8Array (байты)
   * 2. compress (zlib.deflate)
   * 3. XOR-cipher
   */
  public encode(reqBodyString: string): ArrayBuffer {
    const encrypted = deflate(reqBodyString);
    return this.cipherXOR(encrypted).buffer;
  }

  /** Декодирует массив байт в строку, проводя следующие преобразования:
   * 1. XOR-cipher
   * 2. decompress (zlib.inflate)
   * 3. Uint8Array (байты) -> UTF-8 string
   */
  private decode(containerArrayBuffer: ArrayBuffer): string {
    const decrypted = this.cipherXOR(new Uint8Array(containerArrayBuffer));
    return inflate(decrypted, {to: 'string'});
  }

  /** XOR-шифрование (симметричное).
   * @see https://en.wikipedia.org/wiki/XOR_cipher
   */
  private cipherXOR(arr: Uint8Array): Uint8Array {
    const key = this.key, length = this.key.length;
    return arr.map((byte, index) => byte ^ key[index % length]);
  }
}
