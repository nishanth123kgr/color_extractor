const app = require('express')(),
    server = require('http').Server(app),
    io = require('socket.io')(server),
    rtsp = require('rtsp-ffmpeg');
const path = require('path')
const getColors = require('get-image-colors')
const fs = require('fs')
const sharp = require('sharp')
const Jimp = require('jimp');



server.listen(6147);
var uri = 'rtsp://192.168.1.251:8080/h264.sdp',
    stream = new rtsp.FFMpeg({ input: uri });
io.on('connection', function (socket) {
    var pipeStream =  function (data) {
         console.log(data);
        socket.emit('data', data.toString('base64'));

        try {

         Jimp.read(data,  (err, image) => {
            if (err) {
                console.error('Error creating image:', err);
            } else {
                // Save the image to a file
                new Promise((resolve, reject) => {
                    image.write('output.jpg', (err) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve();
                        }
                    });
                }
                ).then(() => {
                    return getColors(path.join(__dirname, 'output.jpg'));
                }).then(colors => {
                    console.log(colors)
                    let color = [0, 0, 0]
                    colors.forEach(c => {
                        color[0] += c._rgb[0]
                        color[1] += c._rgb[1]
                        color[2] += c._rgb[2]
                    })
                    color = color.map(c => c / colors.length)
                    console.log(color)
                }).catch(error => {
                    console.error('Error processing image:', error);
                });

                //  image.write('output.jpg').then(()=>{
                //     getColors(path.join(__dirname, 'output.jpg')).then(colors => {
                //         console.log(colors)
                //         let color = [0, 0, 0]
                //         colors.forEach(c => {
                //             color[0] += c._rgb[0]
                //             color[1] += c._rgb[1]
                //             color[2] += c._rgb[2]
                //         })
    
                //         color = color.map(c => c / colors.length)
                //         console.log(color)
                //     })
                //  });
                //   console.log();
                 
            }
        });
    } catch (error) {
    }



    };
    stream.on('data', pipeStream);
    socket.on('disconnect', function () {
        stream.removeListener('data', pipeStream);
    });
});

// io.on('connection', function (socket) {
//     var pipeStream =  function (data) {
//         console.log(data);
//         socket.emit('data', data.toString('base64'));

//         // Process the image
//         Jimp.read(data,  (err, image) => {
//             if (err) {
//                 console.error('Error creating image:', err);
//             } else {
//                 try {
//                     // Save the image to a file
//                      image.write('output.jpg');
                    
//                     // Get colors from the image
//                     const colors =  getColors(path.join(__dirname, 'output.jpg'));
//                     let color = [0, 0, 0];
//                     colors.forEach(c => {
//                         color[0] += c._rgb[0];
//                         color[1] += c._rgb[1];
//                         color[2] += c._rgb[2];
//                     });
//                     color = color.map(c => c / colors.length);
//                     console.log('Average color:', color);

//                     // Emit colors to clients
//                     // socket.emit('colors', color);
//                 } catch (error) {
//                     console.error('Error processing image:', error);
//                 }
//             }
//         });
//     };

//     // Call pipeStream every 5 seconds
//     const interval = setInterval(() => {
//         console.log('Getting colors...');
//         stream.on('data', pipeStream);
//     }, 5000);

//     socket.on('disconnect', function () {
//         clearInterval(interval); // Stop the interval when client disconnects
//     });
// });

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});