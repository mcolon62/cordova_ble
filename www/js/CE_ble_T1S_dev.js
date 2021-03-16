class T1S_device
{

    constructor()
    {

    }

    foundDevices = [];

    // ----------------------------------------------------------------------------
    log = (msg, color) => {
    // ----------------------------------------------------------------------------
        var m_area = document.getElementById("areaMessaggi");
        if (m_area)
        {
            // m_area.innerHTML += "&#13;" + msg;
            if (color == 'NORMAL')
            {
                m_area.innerHTML += "<p style=\"color:lightgreen;margin:0;\">" + msg + "</p>";
            }
            else if (color == 'EVID')
            {
                m_area.innerHTML += "<p style=\"color:cyan;margin:0;\">" + msg + "</p>";
            }
            else if (color == 'DESC')
            {
                m_area.innerHTML += "<p style=\"color:white;margin:0;\">" + msg + "</p>";
            }
            else if (color == 'ERROR')
            {
                m_area.innerHTML += "<p style=\"color:red;margin:0;\">" + msg + "</p>";
            }
        }
        console.log(msg);
    }
    // ----------------------------------------------------------------------------

    // ----------------------------------------------------------------------------
    handleError= (error) =>
    // ----------------------------------------------------------------------------
    {
        this.log("ERROR: " + JSON.stringify(error), 'ERROR');
    }
    // ----------------------------------------------------------------------------

    // ----------------------------------------------------------------------------
    startScanError = (result) =>
    // ----------------------------------------------------------------------------
    {
        this.log("STARTSCAN: ERROR - " + JSON.stringify(result), 'NORMAL');
    }
    // ----------------------------------------------------------------------------

    // ----------------------------------------------------------------------------
    startScanSuccess = (result) =>
    // ----------------------------------------------------------------------------
    {
        this.log("STARTSCAN: OK - " + JSON.stringify(result), 'NORMAL');
        this.log("STARTSCAN: OK - " + result.name + ' - ' + result.id, 'EVID');

        if (result.name == "T1S")
        {
            this.log('FOUND DEVICE: [' + result.name + '] at ' + result.id, 'EVID');
            this.foundDevices.push(result);
            if (result.name == "T1S")
            {
                this.log('Stop scanning...', 'NORMAL');
                ble.stopScan(this.stopScanSuccess, this.handleError, { services: [] });
                // var params = { "address": result.id }
                this.log('Connecting to ' + result.id + '...', 'NORMAL');
                this.T1S_Address = result.id;
                ble.connect(this.T1S_Address, this.connectSuccess, this.connectError);
            }
        }
    }
    // ----------------------------------------------------------------------------

    T1S_Connected = 0;
    T1S_Address = '';
    T1S_Temperature = 0.0;

    // ----------------------------------------------------------------------------
    writeFile = (fileEntry, dataObj) =>
    // ----------------------------------------------------------------------------
    {
        return $q(function (resolve, reject) 
        {
            fileEntry.createWriter(function (fileWriter) 
            {
                fileWriter.onwriteend = function () 
                {
                    resolve();
                };
                fileWriter.onerror = function (e) 
                {
                    reject(e);
                };
                fileWriter.write(dataObj);
            });
        });
    }

    // ----------------------------------------------------------------------------
    toHexString = (byteArray) =>
    // ----------------------------------------------------------------------------
    {
        return Array.from(byteArray, function(byte) 
        {
        return ('0' + (byte & 0xFF).toString(16)).slice(-2);
        }).join('')
    }
    // ----------------------------------------------------------------------------

    // ----------------------------------------------------------------------------
    onTemperatureNotification = (buffer) =>
    // ----------------------------------------------------------------------------
    {
        // this.log("TEMPERATURE: OK - received...", 'NORMAL');
        var data = new Uint8Array(buffer);
        // log("TEMPERATURE: OK - " + data[0] + ' - '+ data[1] + ' - '+ data[2] + ' - '+ data[3] + ' - '+ data[4] + ' - '+ data[5] + ' - '+ data[6] + ' - ' + data[7], 'NORMAL');

        T1S_Temperature = data[6] + data[7] / 10;
        log("TEMPERATURE: OK - " + t, 'NORMAL');
        // this.log('---> ' + this.toHexString(data), 'EVID' );
    }
    // ----------------------------------------------------------------------------

    // ----------------------------------------------------------------------------
    writeSuccess = (result) =>
    // ----------------------------------------------------------------------------
    {
        this.log("WRITE: OK - " + JSON.stringify(result), 'NORMAL');
    }
    // ----------------------------------------------------------------------------

    // ----------------------------------------------------------------------------
    writeError = (result) =>
    // ----------------------------------------------------------------------------
    {
        this.log("WRITE - ERROR: " + JSON.stringify(result), 'ERROR');
    }
    // ----------------------------------------------------------------------------

    // ----------------------------------------------------------------------------
    connectSuccess = (result) =>
    // ----------------------------------------------------------------------------
    {
        // log("CONNECTION: OK - " + JSON.stringify(result), 'EVID');
        this.log("CONNECTION: OK", 'EVID');

        // -- service           6e400001-b5a3-f393-e0a9-e50e24dcca9e
        // -- car. risposta     6e400003-b5a3-f393-e0a9-e50e24dcca9e
        // -- car. comando      6e400002-b5a3-f393-e0a9-e50e24dcca9e

        this.T1S_Connected = 1;
        var commandTempStart = new Uint8Array([0xab, 0x00, 0x04, 0xff, 0x86, 0x80, 0x01]);

        ble.startNotification (this.T1S_Address, 
            "6e400001-b5a3-f393-e0a9-e50e24dcca9e", 
            "6E400003-B5A3-F393-E0A9-E50E24DCCA9E", 
            this.onTemperatureNotification,
            function(failure) {log("Failed to read characteristic from device.");}
        );

        ble.write(this.T1S_Address, "6e400001-b5a3-f393-e0a9-e50e24dcca9e", "6E400002-B5A3-F393-E0A9-E50E24DCCA9E", commandTempStart.buffer, this.writeSuccess, this.writeError)

    }
    // ----------------------------------------------------------------------------

    // ----------------------------------------------------------------------------
    connectError = (result) =>
    // ----------------------------------------------------------------------------
    {
        this.log("CONNECTION: ERROR - " + JSON.stringify(result), 'ERROR');
    }
    // ----------------------------------------------------------------------------

    // ----------------------------------------------------------------------------
    stopScanSuccess = (result) =>
    // ----------------------------------------------------------------------------
    {
        this.log("stopScanSuccess(" + JSON.stringify(result) + ")", 'NORMAL');
    }
    // ----------------------------------------------------------------------------

    // ----------------------------------------------------------------------------
    startScan = () =>
    // ----------------------------------------------------------------------------
    {

        this.log("Starting scan for devices...", 'NORMAL');

        this.foundDevices = [];

        try
        {
            this.log("Platform: " + window.cordova.platformId, 'NORMAL');
            ble.startScan([], this.startScanSuccess, this.startScanError);
        }
        catch(err)
        {
            this.log('[1] - EXCEPTION: ' + err, 'ERROR');
            // alert('[1] - EXCEPTION: ' + err);
        }
    }
    // ----------------------------------------------------------------------------

    // ----------------------------------------------------------------------------
    activateDevice = () =>
    // ----------------------------------------------------------------------------
    {
        document.getElementById('deviceready').classList.add('ready');

        var i = 0;
        // while(1)
        // {
            if (this.T1S_Address == '')
            {
                i++;
                this.log('SCAN START - ' + i, 'NORMAL');
                ble.stopScan(this.stopScanSuccess, this.handleError, { services: [] });
                this.startScan();
                // await new Promise(r => setTimeout(r, 30000));
            }
        // }
    }
    // ----------------------------------------------------------------------------
  
}

T1S = new T1S_device();

// ----------------------------------------------------------------------------
function permission_success(status)
// ----------------------------------------------------------------------------
{
    if( !status.hasPermission ) 
    {
        T1S.log('Error - unable to activate Location permission', 'ERROR');
    }
    else
    {
        T1S.log('Permissions OK!', 'NORMAL');
        T1S.activateDevice();
    }
}
// ----------------------------------------------------------------------------

// ----------------------------------------------------------------------------
function permission_error()
// ----------------------------------------------------------------------------
{
    T1S.log('Location permission is not turned on');
}
// ----------------------------------------------------------------------------

// ----------------------------------------------------------------------------
function refreshT1Data()
// ----------------------------------------------------------------------------
{
    if (T1S)
    {
        var el = document.getElementById('temperature');
        if (T1S.T1S_Connected == 1)
        {
            if (el)
            {
                el.innerHTML = T1S_Temperature;
            }
        }
        else
        {
            el.innerHTML = '-.-';
        }
    }
}
// ----------------------------------------------------------------------------

// ----------------------------------------------------------------------------
function onDeviceReady() 
// ----------------------------------------------------------------------------
{
    T1S.log('App started - Device gateway 2.01.40', 'NORMAL');
    // Cordova is now initialized. Have fun!
    var permissions = cordova.plugins.permissions;
    var list = [
        permissions.ACCESS_COARSE_LOCATION,
        permissions.WRITE_EXTERNAL_STORAGE
    ];
    T1S.log('Requesting permissions...', 'NORMAL');
    permissions.requestPermissions(list, permission_success, permission_error);
}
// ----------------------------------------------------------------------------

document.addEventListener('deviceready', onDeviceReady, false);

rff = setInterval(refreshT1Data, 2000);
