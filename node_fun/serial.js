var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '**pass**'
});
var wol = require('wake_on_lan');

connection.connect(function(err) {
  if (err) {
    console.error('error connecting to mysql: ' + err.stack);
    return;
  }
  console.log('connected to mysql as id ' + connection.threadId);
});

setInterval(function(){  /// EVERY 3 HOUR RESET CONNECTION MYSQL
  connection.end(function(err) {
  // The connection is terminated now
  console.log("Closing Connection (Every 3 Hours).");
});
  connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '**pass**'
});
  connection.connect(function(err) {
  if (err) {
    console.error('error connecting to mysql: ' + err.stack);
    return;
  }
  console.log('RE-connected to mysql as id ' + connection.threadId);
});
}, 3* 60 * 60 * 1000);
var http = require("http");
setInterval( function() {
var options = {
  host: 'slackiswack.com',
  port: 80,
  path: '/wolCheck.php'
};
http.get(options, function(resp){
  resp.on('data', function(chunk){
    //do something with chunk
      if(parseInt(chunk) == 1)
      {
          console.log("SendingWake");
          wol.wake('FC:AA:14:79:B3:A3');
          setWolOff(true);
      }
      else
      {
      }
  });
}).on("error", function(e){
  console.log("Got error: " + e.message);
});
}, 1000 * 60 * 5); // every five minutes check

function setWolOff(changeBack)
{
    if(changeBack)
    {
    options = {
      host: 'slackiswack.com',
      port: 80,
      path: '/wol.php?set=off'
    };

    http.get(options, function(resp){
      resp.on('data', function(chunk){
    //switching back mysql value
      });
    }).on("error", function(e){
      console.log("Got error: " + e.message);
    });
    }
}



var millisChanged = 0; // debounce button/radio
var millisNow = 0;

var SerialPort = require("serialport").SerialPort;
var serialPort = new SerialPort("/dev/ttyUSB0", {
  baudrate: 9600
});
serialPort.open(function (error) {
  if ( error ) {
    console.log('Serial Port didn\'t open: '+error);
  } else {
    console.log('Serial Port Opened.');
  }
  serialPort.on('data', function(data) {
    console.log('Serial Data received: ' + data);
    if(data == 'h')
    {
      wol.wake('FC:AA:14:79:B3:A3');
      var magic_packet = wol.createMagicPacket('FC:AA:14:79:B3:A3');
    }
    if(data == 'a' || data == 'b')
    {
      var tempDate = new Date();
      millisNow = tempDate.getTime();
      console.log(millisNow);
      var tempQuery = "Describe nodejs.lights";
      if(lights[0] == 0 && millisChanged < (millisNow - 200))
      {
        //turn on
        tempDate = new Date();
        millisChanged = tempDate.getTime();
        tempQuery = "UPDATE nodejs.lights SET status = 1 WHERE lightID = 1";
        serialPort.write("C");
        lights[0] = 1;
        io.emit("lightState", '1on');
      }
      else if(lights[0] == 1 && millisChanged < (millisNow - 200))
      {
        //turn off
        tempDate = new Date();
        millisChanged = tempDate.getTime();
        tempQuery = "UPDATE nodejs.lights SET status = 0 WHERE lightID = 1";
        serialPort.write("D");
        lights[0] = 0;
        io.emit("lightState", '1off');
      }
      connection.query(tempQuery, function(err, rows, fields) {
      if (err) throw err;
      });
    }
    else if(data == 'c')
    {
      var tempQuery = "Describe nodejs.lights";
      if(lights[1] == 0)
      {
        //turn on
        tempQuery = "UPDATE nodejs.lights SET status = 1 WHERE lightID = 2";
        serialPort.write("E");
        lights[1] = 1;
        io.emit("lightState", '2on');
      }
      else if(lights[1] == 1)
      {
        //turn off
        tempQuery = "UPDATE nodejs.lights SET status = 0 WHERE lightID = 2";
        serialPort.write("F");
        lights[1] = 0;
        io.emit("lightState", '2off');
      }
      connection.query(tempQuery, function(err, rows, fields) {
      if (err) throw err;
      });
    }
    else if(data == 'd')
    {
      var tempQuery = "Describe nodejs.lights";
      if(lights[2] == 0)
      {
        //turn on
        tempQuery = "UPDATE nodejs.lights SET status = 1 WHERE lightID = 3";
        serialPort.write("G");
        lights[2] = 1;
        io.emit("lightState", '3on');
      }
      else if(lights[2] == 1)
      {
        //turn off
        tempQuery = "UPDATE nodejs.lights SET status = 0 WHERE lightID = 3";
        serialPort.write("H");
        lights[2] = 0;
        io.emit("lightState", '3off');
      }
      connection.query(tempQuery, function(err, rows, fields) {
      if (err) throw err;
      });
    }
    else if(data == 'e')
    {
      var tempQuery = "Describe nodejs.lights";
      if(lights[3] == 0)
      {
        //turn on
        tempQuery = "UPDATE nodejs.lights SET status = 1 WHERE lightID = 4";
        serialPort.write("I");
        lights[3] = 1;
        io.emit("lightState", '4on');
      }
      else if(lights[3] == 1)
      {
        //turn off
        tempQuery = "UPDATE nodejs.lights SET status = 0 WHERE lightID = 4";
        serialPort.write("J");
        lights[3] = 0;
        io.emit("lightState", '4off');
      }
      connection.query(tempQuery, function(err, rows, fields) {
      if (err) throw err;
      });
    }
    else if(data == 'j')
    {
      var tempQuery = "UPDATE nodejs.lights SET status = 0 WHERE lightID > 0";
      serialPort.write("D");
      serialPort.write("F");
      serialPort.write("H");
      serialPort.write("J");

      lights[0] = 0;
      lights[1] = 0;
      lights[2] = 0;
      lights[3] = 0; 

      io.emit("lightState", '1off');
      io.emit("lightState", '2off');
      io.emit("lightState", '3off');
      io.emit("lightState", '4off');

      console.log('Turned off all lights from Button');
      connection.query(tempQuery, function(err, rows, fields) {
        if (err) throw err;
        });
    }
    

  });
});

var fs = require('fs');
var express = require('express');
var app = express();
app.use("/static", express.static('/node_fun/static'));
var server  = app.listen(3000);
var io = require('socket.io').listen(server);

var lights = new Array();

io.on('connection', function (socket) {
  console.log("Connected New Socket.");
    //console.log(lights[0]);
    if(lights[0] == 1)
    {
      io.emit("lightState", '1on');
    }
    else if(lights[0] == 0)
    {
      io.emit("lightState", '1off');
    }
    if(lights[1] == 1)
    {
      io.emit("lightState", '2on');
    }
    else if(lights[1] == 0)
    {
      io.emit("lightState", '2off');
    }
    if(lights[2] == 1)
    {
      io.emit("lightState", '3on');
    }
    else if(lights[2] == 0)
    {
      io.emit("lightState", '3off');
    }
    if(lights[3] == 1)
    {
      io.emit("lightState", '4on');
    }
    else if(lights[3] == 0)
    {
      io.emit("lightState", '4off');
    }

  socket.on('lightState', function (data) {
    var tempQuery = "Describe nodejs.lights";
    if(data == '1on' && lights[0] == 0)
    {
      console.log("Received on data socket and sending out on to everyone else.");
      tempQuery = "UPDATE nodejs.lights SET status = 1 WHERE lightID = 1";
      serialPort.write("C");
      lights[0] = 1;
      io.emit("lightState", '1on');
    }
    if(data == '1off' && lights[0] == 1)
    {
      console.log("Received on data socket and sending out off to everyone else.");
      tempQuery = "UPDATE nodejs.lights SET status = 0 WHERE lightID = 1";
      serialPort.write("D");
      lights[0] = 0;
      io.emit("lightState", '1off');
    }
    if(data == '2on' && lights[1] == 0)
    {
      console.log("Received on data socket and sending out on to everyone else.");
      tempQuery = "UPDATE nodejs.lights SET status = 1 WHERE lightID = 2";
      serialPort.write("E");
      lights[1] = 1;
      io.emit("lightState", '2on');
    }
    if(data == '2off' && lights[1] == 1)
    {
      console.log("Received on data socket and sending out off to everyone else.");
      tempQuery = "UPDATE nodejs.lights SET status = 0 WHERE lightID = 2";
      serialPort.write("F");
      lights[1] = 0;
      io.emit("lightState", '2off');
    }
    if(data == '3on' && lights[2] == 0)
    {
      console.log("Received on data socket and sending out on to everyone else.");
      tempQuery = "UPDATE nodejs.lights SET status = 1 WHERE lightID = 3";
      serialPort.write("G");
      lights[2] = 1;
      io.emit("lightState", '3on');
    }
    if(data == '3off' && lights[2] == 1)
    {
      console.log("Received on data socket and sending out off to everyone else.");
      tempQuery = "UPDATE nodejs.lights SET status = 0 WHERE lightID = 3";
      serialPort.write("H");
      lights[2] = 0;
      io.emit("lightState", '3off');
    }
    if(data == '4on' && lights[3] == 0)
    {
      console.log("Received on data socket and sending out on to everyone else.");
      tempQuery = "UPDATE nodejs.lights SET status = 1 WHERE lightID = 4";
      serialPort.write("I");
      lights[3] = 1;
      io.emit("lightState", '4on');
    }
    if(data == '4off' && lights[3] == 1)
    {
      console.log("Received on data socket and sending out off to everyone else.");
      tempQuery = "UPDATE nodejs.lights SET status = 0 WHERE lightID = 4";
      serialPort.write("J");
      lights[3] = 0;
      io.emit("lightState", '4off');
    }
    connection.query(tempQuery, function(err, rows, fields) {
    if (err) throw err;
    });  
  });
});
app.get('/', function(request, response) {
    fs.readFile('/node_fun/index.html', function(err, data){
        response.send(data.toString());
    });
});
app.get('/allOff', function(request, response) {
  if(lights[0] == 1 || lights[1] == 1 || lights[2] == 1 || lights[3] == 1)
  {
    var tempQuery = "UPDATE nodejs.lights SET status = 0 WHERE lightID > 0";
    serialPort.write("D");
    serialPort.write("F");
    serialPort.write("H");
    serialPort.write("J");

    lights[0] = 0;
    lights[1] = 0;
    lights[2] = 0;
    lights[3] = 0; 

    io.emit("lightState", '1off');
    io.emit("lightState", '2off');
    io.emit("lightState", '3off');
    io.emit("lightState", '4off');

    console.log('Turned off all lights from HTTP Request');
    response.send('Lights All Off.');
    connection.query(tempQuery, function(err, rows, fields) {
      if (err) throw err;
      });
  }
  else
{
   response.send('Lights already off.');
   console.log('Received on from HTTP Request, but already on.');
}
});
app.get('/cpuOn', function(request, response) {
    wol.wake('FC:AA:14:79:B3:A3');
    console.log("Waking Computer.");
    response.send('Waking Computer.');
});
app.get('/resetLog', function(request, response) {
	fs.truncate('/node_fun/static/LOGFILE.txt', 0, function(){console.log("Reset Log.");})
    response.send('Reset Log.');
});
app.get('/1on', function(request, response) {
  if(lights[0] == 0)
  {
    var tempQuery = "UPDATE nodejs.lights SET status = 1 WHERE lightID = 1";
    serialPort.write("C");
    lights[0] = 1;
    io.emit("lightState", '1on');
    console.log('Turned on from HTTP Request');
    response.send('Light on.');
    connection.query(tempQuery, function(err, rows, fields) {
      if (err) throw err;
      });
  }
  else
{
   response.send('Light already on.');
   console.log('Received on from HTTP Request, but already on.');
}
});

app.get('/1off', function(request, response) {
  if(lights[0] == 1)
  {
    var tempQuery = "UPDATE nodejs.lights SET status = 0 WHERE lightID = 1";
    serialPort.write("D");
    lights[0] = 0;
    io.emit("lightState", '1off');
    console.log('Turned on from HTTP Request');
    response.send('Light off.');
    connection.query(tempQuery, function(err, rows, fields) {
      if (err) throw err;
      });
  }
  else
{
  response.send('Light already off.');
  console.log('Turned off from HTTP Request, but already off.');
} 
});


app.get('/1tog', function(request, response) {
  if(lights[0] == 0)
  {
    var tempQuery = "UPDATE nodejs.lights SET status = 1 WHERE lightID = 1";
    serialPort.write("C");
    lights[0] = 1;
    io.emit("lightState", '1on');
    console.log('Turned 1 on from HTTP Request');
    response.send('Light 1 on.');
    connection.query(tempQuery, function(err, rows, fields) {
      if (err) throw err;
      });
  }
  else if(lights[0] = 1)
  {
    var tempQuery = "UPDATE nodejs.lights SET status = 0 WHERE lightID = 1";
    serialPort.write("D");
    lights[0] = 0;
    io.emit("lightState", '1off');
    console.log('Toggled 1 off from HTTP Request');
    response.send('Light 1 off.');
    connection.query(tempQuery, function(err, rows, fields) {
      if (err) throw err;
      });
  }
});

app.get('/2tog', function(request, response) {
  if(lights[1] == 0)
  {
    var tempQuery = "UPDATE nodejs.lights SET status = 1 WHERE lightID = 2";
    serialPort.write("E");
    lights[1] = 1;
    io.emit("lightState", '2on');
    console.log('Turned 2 on from HTTP Request');
    response.send('Light 2 on.');
    connection.query(tempQuery, function(err, rows, fields) {
      if (err) throw err;
      });
  }
  else if(lights[1] = 1)
  {
    var tempQuery = "UPDATE nodejs.lights SET status = 0 WHERE lightID = 2";
    serialPort.write("F");
    lights[1] = 0;
    io.emit("lightState", '2off');
    console.log('Toggled 2 off from HTTP Request');
    response.send('Light 2 off.');
    connection.query(tempQuery, function(err, rows, fields) {
      if (err) throw err;
      });
  }
});

app.get('/3tog', function(request, response) {
  if(lights[2] == 0)
  {
    var tempQuery = "UPDATE nodejs.lights SET status = 1 WHERE lightID = 3";
    serialPort.write("G");
    lights[2] = 1;
    io.emit("lightState", '3on');
    console.log('Turned 3 on from HTTP Request');
    response.send('Light 3 on.');
    connection.query(tempQuery, function(err, rows, fields) {
      if (err) throw err;
      });
  }
  else if(lights[2] == 1)
  {
    var tempQuery = "UPDATE nodejs.lights SET status = 0 WHERE lightID = 3";
    serialPort.write("H");
    lights[2] = 0;
    io.emit("lightState", '3off');
    console.log('Toggled 3 off from HTTP Request');
    response.send('Light 3 off.');
    connection.query(tempQuery, function(err, rows, fields) {
      if (err) throw err;
      });
  }
});

app.get('/4tog', function(request, response) {
  if(lights[3] == 0)
  {
    var tempQuery = "UPDATE nodejs.lights SET status = 1 WHERE lightID = 4";
    serialPort.write("I");
    lights[3] = 1;
    io.emit("lightState", '4on');
    console.log('Turned 4 on from HTTP Request');
    response.send('Light 4 on.');
    connection.query(tempQuery, function(err, rows, fields) {
      if (err) throw err;
      });
  }
  else if(lights[3] == 1)
  {
    var tempQuery = "UPDATE nodejs.lights SET status = 0 WHERE lightID = 4";
    serialPort.write("J");
    lights[3] = 0;
    io.emit("lightState", '4off');
    console.log('Toggled 4 off from HTTP Request');
    response.send('Light 4 off.');
    connection.query(tempQuery, function(err, rows, fields) {
      if (err) throw err;
      });
  }
});
/*
var osc = require("osc");

var udpPort = new osc.UDPPort({
    localAddress: "10.0.0.155",
    localPort: 3333
});
// Listen for incoming OSC bundles.
udpPort.on("message", function (oscMsg) {
    console.log("An OSC message just arrived!", oscMsg.args[0]);
    if(oscMsg.args[0] == 'on' || oscMsg.args[0] == 1)
    {
      if(lights[0] == 0)
      {
        var tempQuery = "UPDATE nodejs.lights SET status = 1 WHERE lightID = 1";
        serialPort.write("D");
        lights[0] = 1;
        io.emit("lightState", '1on');
        console.log('Turned on from OSC.');
        connection.query(tempQuery, function(err, rows, fields) {
      if (err) throw err;
      });
      }
      
    }
    else if(oscMsg.args[0] == 'off' || oscMsg.args[0] == 0)
    {
      if(lights[0] == 1)
      {
        var tempQuery = "UPDATE nodejs.lights SET status = 0 WHERE lightID = 1";
        serialPort.write("C");
        lights[0] = 0;
        io.emit("lightState", '1off');
        console.log('Turned off from OSC.');
        connection.query(tempQuery, function(err, rows, fields) {
      if (err) throw err;
      });
    }
      
    }
});
*/
//if restarted look at mysql table and turn on or off the light
var tempQuery = "SELECT status FROM nodejs.lights";
connection.query(tempQuery, function(err, rows, fields) {
      if (err) throw err;
      if(rows[0].status == 1)
      {
        console.log('Checked Mysql on start and light 1 is on.');
        serialPort.write("C");
        lights[0] = 1;
        io.emit("lightState", '1on');
      }
      else if(rows[0].status == 0)
      {
        serialPort.write("D");
        lights[0] = 0;
        io.emit("lightState", '1off');
        console.log('Checked Mysql on start and light 1 is off.');
      }
      else
      {
        console.log('Checked Mysql on start and didn\'t get on or off.');
      }

      if(rows[1].status == 1)
      {
        console.log('Checked Mysql on start and light 2 is on.');
        serialPort.write("E");
        lights[1] = 1;
        io.emit("lightState", '2on');
      }
      else if(rows[1].status == 0)
      {
        serialPort.write("F");
        lights[1] = 0;
        io.emit("lightState", '2off');
        console.log('Checked Mysql on start and light 2 is off.');
      }
      else
      {
        console.log('Checked Mysql on start and didn\'t get on or off.');
      }
      if(rows[2].status == 1)
      {
        console.log('Checked Mysql on start and light 3 is on.');
        serialPort.write("G");
        lights[2] = 1;
        io.emit("lightState", '3on');
      }
      else if(rows[2].status == 0)
      {
        serialPort.write("H");
        lights[2] = 0;
        io.emit("lightState", '3off');
        console.log('Checked Mysql on start and light 3 is off.');
      }
      else
      {
        console.log('Checked Mysql on start and didn\'t get on or off.');
      }
      if(rows[3].status == 1)
      {
        console.log('Checked Mysql on start and light 4 is on.');
        serialPort.write("I");
        lights[3] = 1;
        io.emit("lightState", '4on');
      }
      else if(rows[3].status == 0)
      {
        serialPort.write("J");
        lights[3] = 0;
        io.emit("lightState", '4off');
        console.log('Checked Mysql on start and light 4 is off.');
      }
      else
      {
        console.log('Checked Mysql on start and didn\'t get on or off.');
      }
});


// Open the socket.
//udpPort.open();
