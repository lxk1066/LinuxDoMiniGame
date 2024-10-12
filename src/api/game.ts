import request from '@/utils/request'

export const getMiniGameById = (miniGameId: number) => {
  return request.get('/game/' + miniGameId)
}

export const getGameRoomById = (roomId: string) => {
  return request.get('/game/playRoom/' + roomId)
}

export const getServerInfo = () => {
  return request.get('/game/getServerInfo')
}
