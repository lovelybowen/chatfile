import { File } from 'koa-multer'
import { Document } from 'langchain/document'
import { BaseDocumentLoader } from 'langchain/document_loaders'
import type { TextItem } from 'pdfjs-dist/types/src/display/api.js'

export abstract class BufferLoader extends BaseDocumentLoader {
  constructor(public file: File) {
    super()
  }

  protected abstract parse(
    raw: Buffer,
    metadata: Document['metadata'],
  ): Promise<Document[]>

  public async load(): Promise<Document[]> {
    let buffer: Buffer
    let metadata: Record<string, string>
    buffer = this.file.buffer
    metadata = { source: this.file.originalname }

    return this.parse(buffer, metadata)
  }
}

export class PDFLoader extends BufferLoader {
  private splitPages: boolean

  private pdfjs: typeof PDFLoaderImports

  constructor(
    file: File,
    { splitPages = true, pdfjs = PDFLoaderImports } = {},
  ) {
    super(file)
    this.splitPages = splitPages
    this.pdfjs = pdfjs
  }

  public async parse(raw: Buffer, metadata: Document['metadata']): Promise<Document[]> {
    const { getDocument, version } = await this.pdfjs()
    const pdf = await getDocument({
      data: new Uint8Array(raw.buffer),
      useWorkerFetch: false,
      isEvalSupported: false,
      useSystemFonts: true,
    }).promise
    const meta = await pdf.getMetadata().catch(() => null)

    const documents: Document[] = []

    for (let i = 1; i <= pdf.numPages; i += 1) {
      const page = await pdf.getPage(i)
      const content = await page.getTextContent()
      const text = content.items.map(item => (item as TextItem).str).join('\n')

      documents.push(
        new Document({
          pageContent: text,
          metadata: {
            ...metadata,
            pdf: {
              version,
              info: meta?.info,
              metadata: meta?.metadata,
              totalPages: pdf.numPages,
            },
            loc: {
              pageNumber: i,
            },
          },
        }),
      )
    }

    if (this.splitPages) {
      return documents
    }

    return [
      new Document({
        pageContent: documents.map(doc => doc.pageContent).join('\n\n'),
        metadata: {
          ...metadata,
          pdf: {
            version,
            info: meta?.info,
            metadata: meta?.metadata,
            totalPages: pdf.numPages,
          },
        },
      }),
    ]
  }
}

async function PDFLoaderImports() {
  try {
    const mod = await import('pdfjs-dist/legacy/build/pdf.js')
    const { getDocument, version } = mod
    return { getDocument, version }
  } catch (e) {
    console.error(e)
    throw new Error(
      'Failed to load pdfjs-dist. Please install it with eg. `npm install pdfjs-dist`.',
    )
  }
}
