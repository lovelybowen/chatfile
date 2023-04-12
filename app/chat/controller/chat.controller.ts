import { Chat, Message } from '@prisma/client'
import { ApiResponse, successResponse } from 'app/common/response'
import prisma from 'app/helpers/client'
import { print } from 'configs/utils'
import { Body, JsonController, Param, Post, QueryParam } from 'routing-controllers'
import { Service } from 'typedi'

@JsonController()
@Service()
export class ChatController {
  /**
   * 查询对话列表
   *
   * @param page 页数
   * @param limit 每页条数
   * @returns ApiResponse<Chat[]>
   */
  @Post('/chats')
  async chats(
    @QueryParam('page') page: number = 1,
    @QueryParam('limit') limit: number = 20,
  ): Promise<ApiResponse<Chat[]>> {
    const chats = await prisma.chat.findMany({
      skip: page - 1,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    })

    return successResponse(chats)
  }

  @Post('/chat/:chatId/summary')
  async summary(@Param('chatId') chatId: string): Promise<ApiResponse<Message[]>> {
    return successResponse({
      chat: {
        id: 123456,
        topic: '如何快速暴富.pdf',
        summary:
          '本文档主要阐述了如何快速暴富的原理，你可能有如下几点疑问：1、买彩票可以暴富吗？',
        docmentId: 123456,
        updatedAt: new Date(),
      },
    })
  }

  /**
   * 获取对话信息
   *
   * @param chatId
   * @returns
   */
  @Post('/chat/:chatId/message')
  async message(
    @Param('chatId') chatId: string,
    @QueryParam('page') page: number = 1,
    @QueryParam('limit') limit: number = 20,
  ): Promise<ApiResponse<Message[]>> {
    return successResponse({
      message: [
        {
          id: 123,
          author: 'AI',
          msg: '本文档主要阐述了如何快速暴富的原理，你可能有如下几点疑问：1、买彩票可以暴富吗',
          updatedAt: new Date(),
        },
        {
          id: 123,
          author: 'HUMAN',
          msg: '我想指导如何快速暴富',
          updatedAt: new Date(),
        },
      ],
    })
  }

  @Post('/chat/:chatId')
  async chat(
    @Param('chatId') chatId: string,
    @Body() message: any,
  ): Promise<ApiResponse<Message>> {
    print.log(JSON.stringify(message))

    return successResponse({
      message: {
        id: 123,
        author: 'AI',
        msg: '本文档主要阐述了如何快速暴富的原理，你可能有如下几点疑问：1、买彩票可以暴富吗',
        updatedAt: new Date(),
      },
    })
  }
}
