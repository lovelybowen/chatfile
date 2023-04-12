import { Service } from 'typedi'
import prisma from 'app/helpers/client'
import { Prisma } from '@prisma/client'
import { DirectoryLoader } from 'langchain/document_loaders'
import { CustomPDFLoader } from 'app/helpers/customPDFLoader'
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import { PineconeStore } from 'langchain/vectorstores'
import { OpenAIEmbeddings } from 'langchain/embeddings'
import { makeChain } from 'app/helpers/makechain'
import { pinecone } from 'app/helpers/pinecone-client'
import * as fs from "node:fs/promises";

@Service()
export class SessionsService {
  async query() {
    // OpenAI recommends replacing newlines with spaces for best results
    const sanitizedQuestion = 'How does LLM affect careers?'.trim().replaceAll('\n', ' ')

    const index = (await pinecone()).Index('chatpdf2') //change to your own index name

    /* create vectorstore*/
    const vectorStore = await PineconeStore.fromExistingIndex(
      new OpenAIEmbeddings(
        {
          openAIApiKey: '',
        },
        {
          basePath: 'https://xxxx',
        },
      ),
      {
        pineconeIndex: index,
        textKey: 'text',
        namespace: 'pdf-test',
      },
    )

    const tokens: string[] = []
    const chain = makeChain(vectorStore, (token: string) => {
      tokens.push(token)
    })

    //Ask a question
    const response = await chain.call({
      question: sanitizedQuestion,
      chat_history: [],
    })

    return {
      response,
      tokens,
    }
  }

 
  async create() {
    try {
      /*load raw docs from the all files in the directory */
      const directoryLoader = new DirectoryLoader('app/docs', {
        '.pdf': path => new CustomPDFLoader(path),
      })

      // const loader = new PDFLoader(filePath);
      const rawDocs = await directoryLoader.load()

      /* Split text into chunks */
      const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
      })

      const docs = await textSplitter.splitDocuments(rawDocs)
      console.log('split docs', docs)

      console.log('creating vector store...')
      /*create and store the embeddings in the vectorStore*/
      const embeddings = new OpenAIEmbeddings(
        {
          openAIApiKey: '',
        },
        {
          basePath: 'https://xxxx',
        },
      )


      const index = (await pinecone()).Index('chatpdf2') //change to your own index name

      //embed the PDF documents
      await PineconeStore.fromDocuments(docs, embeddings, {
        pineconeIndex: index,
        namespace: 'pdf-test',
        textKey: 'text',
      })
    } catch (error) {
      console.log('error', error)
      throw new Error('Failed to ingest your data')
    }

    
  }
}
