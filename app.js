
var express = require('express');
var app = express();
var serv = require('http').Server(app);

app.get('/',function(req, res){
    res.sendFile(__dirname + '/client/index.html');
});//localkost:200
app.use('/client',express.static(__dirname + '/client'));
//localhost:2000/client i dalsze jego pliki
serv.listen(2000)
console.log("Server started.");

var SOCKET_LIST = {};
var PLAYER_LIST = {};

var Player = function(id){
    //konstruktor
    var info = {
        x:300,
        y:300,
        id:id,
        number:"" + Math.floor(10 * Math.random()),//floor zwraca liczbe
        pressingUp:false,
        pressingLeft:false,
        pressingRight:false,
        pressingDown:false,
        maxSpeed:10,
        //lol jak będzie true to nie można zatrzymać
    }
    info.updatePosition = function(){
        if(info.pressingUp)
            info.y -= info.maxSpeed;
        if(info.pressingLeft)
            info.x -= info.maxSpeed;
        if(info.pressingRight)
            info.x += info.maxSpeed;
        if(info.pressingDown)
            info.y += info.maxSpeed;
    }
    
    return info;
} 

var io = require('socket.io')(serv,{}); //ładuje i inicjalizuje pliki io i całą bibliotekę
io.sockets.on('connection',function(socket){   
    socket.id = Math.random();
    SOCKET_LIST[socket.id] = socket;
    
    var player = Player(socket.id);
    PLAYER_LIST[socket.id] = player; //dodawanie gracza do listy
    
    socket.on('disconnect',function(){
        delete SOCKET_LIST[socket.id];
        //usuwanie id żeby player zniknął z ekranu po opuszczeniu
        delete PLAYER_LIST[socket.id];
    });
    
    socket.on('klikP',function(data){
        if(data.inputId === 'up')
            player.pressingUp = data.state;
        else if(data.inputId === 'left')
            player.pressingLeft = data.state;
        else if(data.inputId === 'right')
            player.pressingRight = data.state;
        else if(data.inputId === 'down')
            player.pressingDown = data.state;
    });

});

setInterval(function(){
    var pack = []; //info o graczach
    for(var i in PLAYER_LIST){
        var player = PLAYER_LIST[i];
        player.updatePosition();
        pack.push({
            x:player.x,
            y:player.y,
            number:player.number
        //dodaje do talicy noweelemnty i ją poszerza
    });
        
    }
            
        for(var i in SOCKET_LIST){
        var socket = SOCKET_LIST[i];
        socket.emit('zmianyPozycji',pack);
}
},1000/60) 
//wywołuje funkcję z opóźnieniem czasowym - 60 klatek na sekundę
