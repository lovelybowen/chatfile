import { Chat, Docment, SOURCE } from '@prisma/client'
import { successResponse } from 'app/common/response'
import prisma from 'app/helpers/client'
import { PDFLoader } from 'app/helpers/uploadPDFLoader'
import { File } from 'koa-multer'
import {
  BadRequestError,
  Get,
  JsonController,
  Post,
  UploadedFile,
} from 'routing-controllers'
import { Service } from 'typedi'

@JsonController('/docment')
@Service()
export class DocmentController {
  /**
   * 上传pdf文件
   *
   * @returns
   */
  @Post('/parse')
  async parse(@UploadedFile('file', { required: true }) file: File) {
    checkPdfFile(file)
    //const loader = new PDFLoader(file)
    // await loader.load()
    return successResponse({
      chatId: '123456',
    })
  }

  @Get('/test')
  async test() {
    const message = await prisma.docment.create({
      data: {
        name: '',
        mimetype: '',
        size: 1,
        encoding: '',
        source: SOURCE.UPLOAD,
        pageNumber: 2,
      },
    })

    return message
  }
}

function checkPdfFile(file: File) {
  const { mimetype, originalname, size } = file
  if (mimetype !== 'application/pdf' || !originalname.endsWith('.pdf')) {
    throw new BadRequestError('文件格式不正确')
  }
  if (size > 10000000) {
    throw new BadRequestError(`超过文件大小的上限`)
  }
}
