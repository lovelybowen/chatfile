import { RoutingControllersOptions } from 'routing-controllers'
import * as middlewares from 'configs/routing.middlewares'
import * as interceptors from 'configs/interceptors'
import { dictToArray } from 'configs/utils'
import * as constants from 'configs/constants'

import * as docmentControllers from 'app/docment/controller/index'
import * as chatControllers from 'app/chat/controller/index'

export const routingConfigs: RoutingControllersOptions = {
  controllers: [...dictToArray(docmentControllers), ...dictToArray(chatControllers)],

  middlewares: dictToArray(middlewares),

  interceptors: dictToArray(interceptors),

  // router prefix
  // e.g. api => http://hostname:port/{routePrefix}/{controller.method}
  routePrefix: '/api',

  // auto validate entity item
  // learn more: https://github.com/typestack/class-validator
  validation: true,
  development: constants.isProd ? true : false,
}
