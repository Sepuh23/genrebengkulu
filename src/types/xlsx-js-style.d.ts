declare module 'xlsx-js-style' {
  import type { WorkBook, WorkSheet, Range } from 'xlsx'

  export const utils: {
    aoa_to_sheet(data: unknown[][]): WorkSheet
    book_new(): WorkBook
    book_append_sheet(wb: WorkBook, ws: WorkSheet, name: string): void
    encode_cell(addr: { r: number; c: number }): string
    encode_range(range: Range): string
    decode_range(ref: string): Range
  }
  export function writeFile(wb: WorkBook, filename: string): void
}
