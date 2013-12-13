// =============================================================================
//
// Copyright 2013 Neticle Portugal
// http://www.github.com/neticle/nitrous-nodejs-framework
//
// This file is part of "Nitrous/NodeJS", hereafter referred to as "Nitrous".
//
// "Nitrous" is free software: you can redistribute it and/or modify it under 
// the terms of the GNU General Public License as published by the Free Software 
// Foundation, either version 3 of the License, or (at your option) any later
// version.
//
// "Nitrous" is distributed in the hope that it will be useful, but WITHOUT ANY
// WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
// A PARTICULAR PURPOSE. See theGNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License along with
// "Nitrous". If not, see <http://www.gnu.org/licenses/>.
//
// =============================================================================

// Register a new handler without arguments
$.app.handle('GET', '/', function () {

    // Get the current path
    var path = this.session.data.lastPath;
    this.session.data.lastPath = '/';

    // Send a response back to the client
    this.response.send(200, {
        path: '/',
        lastPath: path ? path : 'unknown',
        message: 'You have requested the route path.'
    });

});

// Register a basic POST request that sends back the request body
$.app.handle('POST', '/formulaToMeshGrid', function () {
    //returns a meshgrid, sorted by increasing X, then by increasing Y
    var that = this;
    var formula = this.request.body.formula;
    var xMin = this.request.body.xMin || -2;
    var xMax = this.request.body.xMax || 2;
    var xInterval = this.request.body.xInterval || .2;
    var yMin = this.request.body.yMin || -2;
    var yMax = this.request.body.yMax || 2;
    var yInterval = this.request.body.yInterval || .2;
    var command, path, data;
    var scanDelay = 200; //ms

    //generate random file name
    crypto.randomBytes(24, function (ex, buf) {
        var token = buf.toString('hex');
        path = 'tmp/' + token;
        command = './tmux_scripts/mx "[Y,X] = meshgrid(' + xMin + ':' + xInterval + ':' + xMax + ', ' + yMin + ':' + yInterval + ':' + yMax + ');\n' +
            formula + ';\n' + "save('" + path + "','Z','-ascii');\"";

        //call matlab form command line
        callMathLab();
    });

    function callMathLab() {
        exec(command, function (error, stdout, stderr) {
            //scan for MatLab output, saved to file
            scanForFile();
            //sendResponse();
        });
    }

    function scanForFile() {
        fs.stat(path, function (err, stat) {
            if (err == null) {
                //load file
                fs.readFile(path, "ascii", function(err, data) {
                    if (err) throw err;
                    that.data = data;
                    sendResponse();
                })
            } else {
                //wait and then check for file again
                setTimeout(scanForFile, scanDelay);
            }
        });
    }

    function sendResponse() {
        //send response
        that.response.send(200,
            that.data
            /* { contentType: that.request.contentType,
            body: that.data,
            partCount: that.request.parts.length,
            fileCount: that.request.files.length }*/
        );
    }
});