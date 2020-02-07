
# PickFile.js

This component can be used to easily load user files. See the [demo](https://dundalek.com/pickfile/).

## Features

- drag and drop, file chooser and remote URL support
- vanila JavaScript, no dependencies (browser HTML5 support is needed for drag and drop and multiple files)
- Bootstrap compatible
- CommonJS compatible
- MIT license

## Install

    component install dundalek/pickfile

## Usage

Include it in page:

    <link rel="stylesheet" type="text/css" href="pickfile.css">
    <script type="text/javascript" src="pickfile.js"></script>

```javascript
var pf = new PickFile({
    el: '#selector', // specify existing element, selector or domElement
    datatype: 'Text',
    onLoad: function(data, native) {
        console.log(data); // loaded data
        // native is either File instance or XHR object
    },
    onError: function(error) {
    }
});

// or create new element, append to DOM manually
var pf = new PickFile();
document.body.appendChild(pf.el);
```

Type can be one of (letter case is significant, default is *Text*):

- ArrayBuffer
- BinaryString
- Text

### Downloader component

Widget to download a file. User can specify filename.

```javascript

    var dl = new PickFile.Downloader({
        el: '#downloader',
        placeholder: 'Type a filename',  // default: filename.txt
        filename: 'YourFile.txt',        // default: myfile.txt
        type: 'text/html',               // default: text/plain
        content: 'some content here..',

        // setup content provider
        // will be called when user clicks save file button
        getFile: function(cb) {
            cb({
                content: 'hello' ,
                type: 'text/plain'
            });
        },

        // using short version
        getContent: function(cb) {
            cb('hello');
        }
        
    });

```

## Compatibility

Tested in Chrome 26, Firefox 19, Opera 12. It might work in IE 10, but it has not been tested.



