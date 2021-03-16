var foundDevices = [];

// ----------------------------------------------------------------------------
function log(msg, color)
// ----------------------------------------------------------------------------
{
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
function handleError(error)
// ----------------------------------------------------------------------------
{
    var msg;
    if (error.error && error.message) 
    {
        var errorItems = [];
        if (error.service) 
        {
            errorItems.push("service: " + (uuids[error.service] || error.service));
        }
        if (error.characteristic) 
        {
            errorItems.push("characteristic: " + (uuids[error.characteristic] || error.characteristic));
        }
        msg = "Error on " + error.error + ": " + error.message + (errorItems.length && (" (" + errorItems.join(", ") + ")"));
    }
    else 
    {
        msg = error;
    }
    log(msg, 'NORMAL');
}
// ----------------------------------------------------------------------------

// ----------------------------------------------------------------------------
function addDevice(name, address) 
// ----------------------------------------------------------------------------
{
    var button = document.createElement("button");
    button.style.width = "100%";
    button.style.padding = "10px";
    button.style.fontSize = "16px";
    button.textContent = name + ": " + address;
    document.getElementById("devices").appendChild(button);
}

// ----------------------------------------------------------------------------
function startScanError(result) 
// ----------------------------------------------------------------------------
{
    log("STARTSCAN: ERROR - " + JSON.stringify(result), 'NORMAL');
}
// ----------------------------------------------------------------------------

// ----------------------------------------------------------------------------
function startScanSuccess(result) 
// ----------------------------------------------------------------------------
{
    log("STARTSCAN: OK - " + JSON.stringify(result), 'NORMAL');
    log("STARTSCAN: OK - " + result.name + ' - ' + result.id, 'EVID');

    if (result.name == "T1S")
    {
        log('FOUND DEVICE: [' + result.name + '] at ' + result.id, 'EVID');
        foundDevices.push(result);
        if (result.name == "T1S")
        {
            addDevice(result.name, result.id);
            log('Stop scanning...', 'NORMAL');
            ble.stopScan(stopScanSuccess, handleError, { services: [] });
            // var params = { "address": result.id }
            log('Connecting to ' + result.id + '...', 'NORMAL');
            T1S_Address = result.id;
            ble.connect(T1S_Address, connectSuccess, connectError);
        }

    }
    /*
    if (result.status === "scanStarted") 
    {
        log("startScanSuccess(" + result.status + ")", 'NORMAL');
        log("Scanning for devices (will continue to scan until you select a device)...", 'NORMAL');
    }
    else if (result.status === "scanResult") 
    {
        if (!foundDevices.some(function (device) 
        {
            return device.address === result.address;
        })) 
        {
            log('FOUND DEVICE: [' + result.name + '] at ' + result.address, 'EVID');
            foundDevices.push(result);
            if (result.name == "T1S")
            {
                addDevice(result.name, result.address);
                log('Stop scanning...', 'NORMAL');
                bluetoothle.stopScan(stopScanSuccess, handleError, { services: [] });
                var params = { "address": result.address }
                log('Connecting to ' + result.address + '...', 'NORMAL');
                T1S_Address = result.address;
                bluetoothle.connect(connectSuccess, connectError, params);
            }
        }
    }
    */
}
// ----------------------------------------------------------------------------

var T1S_Connected = 0;
var T1S_Address = '';

// ----------------------------------------------------------------------------
function writeFile(fileEntry, dataObj) 
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

function toHexString(byteArray) 
{
    return Array.from(byteArray, function(byte) 
    {
      return ('0' + (byte & 0xFF).toString(16)).slice(-2);
    }).join('')
  }
// ----------------------------------------------------------------------------
function onTemperatureNotification(buffer)
// ----------------------------------------------------------------------------
{
    log("TEMPERATURE: OK - received...", 'NORMAL');
    var data = new Uint8Array(buffer);
    log("TEMPERATURE: OK - " + data[0] + ' - '+ data[1] + ' - '+ data[2] + ' - '+ data[3] + ' - '+ data[4] + ' - '+ data[5] + ' - '+ data[6] + ' - ' + data[7], 'NORMAL');
    log("TEMPERATURE: OK - " + toHexString(data), 'NORMAL');
}
// ----------------------------------------------------------------------------

// ----------------------------------------------------------------------------
async function writeSuccess(result) 
// ----------------------------------------------------------------------------
{
    log("WRITE: OK - " + JSON.stringify(result), 'NORMAL');
    // await new Promise(r => setTimeout(r, 20000));
    
    // log('SEND NEW COMMAND...', 'NORMAL');
    // var commandTempStart = [ 0xab, 0x00, 0x04, 0xff, 0x86, 0x80, 0x01 ];
    // ble.write(T1S_Address, "6e400001-b5a3-f393-e0a9-e50e24dcca9e", "6E400002-B5A3-F393-E0A9-E50E24DCCA9E", commandTempStart, writeSuccess, writeError)

    /*
    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fs) 
    {
        // var fileDir = cordova.file.externalRootDirectory;
        var fileDir = cordova.file.externalDataDirectory; // .replace(cordova.file.externalRootDirectory, '');
        log("---> Accessing file system: " + cordova.file.externalDataDirectory, 'EVID');
        log("---> Accessing file system: " + cordova.file.externalRootDirectory, 'EVID');
        var fileName = "services.json";
        var filePath = fileDir + fileName;
        log("Accessing file system: " + filePath, 'EVID');
        fs.root.getFile(filePath, { create: true, exclusive: false }, function (fileEntry) 
        {
            writeFile(fileEntry, JSON.stringify(result)).then(function(){
            //do something here
            });
        }, function(err) {log('ERROR 002 - ' + JSON.stringify(err), 'ERROR');});
    }, function(err) {log('ERROR 001 - ', 'ERROR');});
    */
}
// ----------------------------------------------------------------------------

// ----------------------------------------------------------------------------
function writeError(result) 
// ----------------------------------------------------------------------------
{
    log("WRITE - ERROR: " + JSON.stringify(result), 'ERROR');
}
// ----------------------------------------------------------------------------

// ----------------------------------------------------------------------------
function connectSuccess(result) 
// ----------------------------------------------------------------------------
{
    log("CONNECTION: OK - " + JSON.stringify(result), 'EVID');

    // -- service           6e400001-b5a3-f393-e0a9-e50e24dcca9e
    // -- car. risposta     6e400003-b5a3-f393-e0a9-e50e24dcca9e
    // -- car. comando      6e400002-b5a3-f393-e0a9-e50e24dcca9e

    var commandTempStart = new Uint8Array([0xab, 0x00, 0x04, 0xff, 0x86, 0x80, 0x01]);

    // var commandTempStart_Encoded = bluetoothle.bytesToEncodedString(commandTempStart);

    /* 
    var sendObj = {"address": T1S_Address, 
                   // "service": "6E400001-B5A3-F393-E0A9-E50E24DCCA9E", 
                   "service": "0001", 
                   // "characteristic": "6E400002-B5A3-F393-E0A9-E50E24DCCA9E",
                   "characteristic": "CA9E",
                   "value": commandTempStart_Encoded,
                   "type": "noResponse"};
    log('Write command - ADDRESS: ' + sendObj.address, 'EVID');
    log('Write command -   VALUE: ' + sendObj.value, 'EVID');
    bluetoothle.write(writeSuccess, writeError, sendObj);
    */

    ble.startNotification (T1S_Address, 
        "6e400001-b5a3-f393-e0a9-e50e24dcca9e", 
        "6E400003-B5A3-F393-E0A9-E50E24DCCA9E", 
        onTemperatureNotification,
        function(failure){
           log("Failed to read characteristic from device.");}
       );

    ble.write(T1S_Address, "6e400001-b5a3-f393-e0a9-e50e24dcca9e", "6E400002-B5A3-F393-E0A9-E50E24DCCA9E", commandTempStart.buffer, writeSuccess, writeError)

    /*
   var discoverObj = {"address": T1S_Address, "clearCache": true };
   bluetoothle.discover(writeSuccess, writeError, discoverObj);
    */
}
// ----------------------------------------------------------------------------

// ----------------------------------------------------------------------------
function connectError(result) 
// ----------------------------------------------------------------------------
{
    log("CONNECTION: ERROR - " + JSON.stringify(result), 'ERROR');
}
// ----------------------------------------------------------------------------

// ----------------------------------------------------------------------------
function stopScanSuccess(result) 
// ----------------------------------------------------------------------------
{
    log("stopScanSuccess(" + JSON.stringify(result) + ")", 'NORMAL');
}
// ----------------------------------------------------------------------------

// ----------------------------------------------------------------------------
function retrieveConnectedSuccess(result) 
// ----------------------------------------------------------------------------
{
    log("retrieveConnectedSuccess()", 'NORMAL');
    log(result, 'EVID');
    result.forEach(function (device) 
    {
        addDevice(device.name, device.address);
    });
}
// ----------------------------------------------------------------------------

// ----------------------------------------------------------------------------
function startScan()
// ----------------------------------------------------------------------------
{

    log("Starting scan for devices...", 'NORMAL');

    foundDevices = [];
    document.getElementById("devices").innerHTML = "SCAN DEVICES";

    try
    {
        if (window.cordova.platformId === "windows") 
        {
            // alert('Platform ' + window.cordova.platformId + ' - Started');
            log("Platform Windows", 'NORMAL');
            bluetoothle.retrieveConnected(retrieveConnectedSuccess, handleError, {});
        }
        else 
        {
            // alert('Platform ' + window.cordova.platformId + ' - Started');
            log("Platform: " + window.cordova.platformId, 'NORMAL');
            // bluetoothle.startScan(startScanSuccess, handleError, { services: [] });
            ble.startScan([], startScanSuccess, startScanError);
        }
    }
    catch(err)
    {
        log('[1] - EXCEPTION: ' + err, 'ERROR');
        // alert('[1] - EXCEPTION: ' + err);
    }
    document.getElementById("devices").innerHTML = "SCAN DEVICES started...";
}
// ----------------------------------------------------------------------------

// ----------------------------------------------------------------------------
function initializeSuccess(result) 
// ----------------------------------------------------------------------------
{
    if (result.status === "enabled") 
    {
        log("Bluetooth is enabled.", 'NORMAL');
        log(result, 'NORMAL');
        // alert("Bluetooth is enabled");
        startScan();
    }
    else 
    {
        log("Bluetooth is not enabled:", 'ERROR');
        log(result, 'ERROR');
        // alert("Bluetooth is not enabled: " + result.status);
    }
}
// ----------------------------------------------------------------------------

// ----------------------------------------------------------------------------
function initializeBLESuccess()
// ----------------------------------------------------------------------------
{
    log('BLE initialize: OK', 'NORMAL');
    //alert('BLE initialize: OK');
    document.addEventListener('deviceready', function () 
    {
        new Promise(function (resolve) 
        {
            bluetoothle.initialize(resolve, { request: true, statusReceiver: false });
        }).then(initializeSuccess, handleError);
    });
}
// ----------------------------------------------------------------------------

// ----------------------------------------------------------------------------
function initializeBLEError()
// ----------------------------------------------------------------------------
{
    //alert('BLE initialize error!');
    document.addEventListener('deviceready', function () 
    {
        new Promise(function (resolve) {
            bluetoothle.initialize(resolve, { request: true, statusReceiver: false });
        }).then(initializeSuccess, handleError);
    });
}
// ----------------------------------------------------------------------------

// ----------------------------------------------------------------------------
function getAdapterInfoCallback(result)
// ----------------------------------------------------------------------------
{    
    // alert('Found adapter: ' + result.name + 
    //       '\n' + result.address +
    //       '\n' + result.isInitialized +
    //       '\n' + result.isEnabled +
    //       '\n' + result.isScanning +
    //       '\n' + result.isDiscoverable
    // );
}
// ----------------------------------------------------------------------------

function permission_error() 
{
    log('Location permission is not turned on');
}
  
function permission_success( status ) 
{
    if( !status.hasPermission ) 
    {
        log('Error - unable to activate Location permission', 'ERROR');
    }
    else
    {
        log('Permissions OK!', 'NORMAL');
        // bluetoothle.getAdapterInfo(getAdapterInfoCallback);
        // bluetoothle.enable(initializeBLESuccess, initializeBLEError);
        startScan();
        document.getElementById('deviceready').classList.add('ready');
    }
}
  
document.addEventListener('deviceready', onDeviceReady, false);
function onDeviceReady() 
{
    log('App started - Device gateway 1.10.100', 'NORMAL');
    // Cordova is now initialized. Have fun!
    var permissions = cordova.plugins.permissions;
    var list = [
        permissions.ACCESS_COARSE_LOCATION,
        permissions.WRITE_EXTERNAL_STORAGE
      ];
    log('Requesting permissions...', 'NORMAL');
    permissions.requestPermissions(list, permission_success, permission_error);
 
}

