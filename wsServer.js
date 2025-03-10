const express = require('express')
const app = express()
var server = require('http').createServer(app)
var io = require('socket.io')(server)

var PORT = 3000

// 客户端计数
var clientCount = 0

// 用来存储客户端socket
var socketMap = {}

server.listen(PORT)

app.get(/^\/(.*)$/, function(req, res) {
  res.sendFile(req.params[0]?req.params[0]:'index.html', {root: __dirname+'/public' })
});

var bindListener = function(socket, event) {
  socket.on(event, function (data) {
    if(socket.clientNum % 2 === 0){
      if(socketMap[socket.clientNum - 1]) {
        socketMap[socket.clientNum - 1].emit(event, data)
      }
    }else {
      if(socketMap[socket.clientNum + 1]) {
        socketMap[socket.clientNum + 1].emit(event, data)
      }
    }
  })
}

io.on('connection', function (socket) {

  clientCount = clientCount + 1

  socket.clientNum = clientCount

  socketMap[clientCount] = socket

  if(clientCount % 2 === 1){
    socket.emit('waiting', '对面没人呐，找个人一起联机吧')
  } else {
    if(socketMap[(clientCount - 1)]) {
      socket.emit('start')
      socketMap[(clientCount - 1)].emit('start')
    }else {
      socket.emit('leave')
    }
  }

  bindListener(socket, 'init')
  bindListener(socket, 'next')
  bindListener(socket, 'rotate')
  bindListener(socket, 'right')
  bindListener(socket, 'down')
  bindListener(socket, 'left')
  bindListener(socket, 'fall')
  bindListener(socket, 'fixed')
  bindListener(socket, 'line')
  bindListener(socket, 'time')
  bindListener(socket, 'lose')
  bindListener(socket, 'bottomLines')
  bindListener(socket, 'addTailLines')


  socket.on('disconnect', function () {
    if(socket.clientNum % 2 === 0){
      if(socketMap[socket.clientNum - 1]) {
        socketMap[socket.clientNum - 1].emit('leave')
      }
    }else {
      if(socketMap[socket.clientNum + 1]) {
        socketMap[socket.clientNum + 1].emit('leave')
      }
    }
    delete (socketMap[socket.clientNum])
  })



})

console.log('websocket listening on port ' + PORT)