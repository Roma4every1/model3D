import { inflate, deflate } from 'pako';


/** Сериализация и десереализация контейнеров карты. */
export class MapContainerConverter {
  constructor(private readonly key: Uint8Array) {}

  /**
   * Кодирует строку в массив байт, проводя следующие преобразования:
   * 1. compress (zlib.deflate)
   * 2. XOR-cipher
   */
  public encode(data: string): ArrayBuffer {
    const encrypted = deflate(data);
    return this.cipherXOR(encrypted).buffer as ArrayBuffer;
  }

  /**
   * Декодирует массив байт в строку, проводя следующие преобразования:
   * 1. XOR-cipher
   * 2. decompress (zlib.inflate)
   */
  public decode(buffer: ArrayBuffer): string {
    const decrypted = this.cipherXOR(new Uint8Array(buffer));
    return inflate(decrypted, {to: 'string'});
  }

  /**
   * XOR-шифрование (симметричное).
   * @see https://en.wikipedia.org/wiki/XOR_cipher
   */
  private cipherXOR(arr: Uint8Array): Uint8Array {
    const key = this.key, length = this.key.length;
    return arr.map((byte, index) => byte ^ key[index % length]);
  }
}
