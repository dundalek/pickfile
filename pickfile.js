(function (factory) {
    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined' && typeof require !== 'undefined') {
        // CommonJS
        module.exports = factory();
    } else {
        // running in browser
        window.PickFile = factory();
    }
})(function() {

    function init(defaults, options) {
        options = options || {};
        this.options = defaults;
        for (var o in options) {
            this.options[o] = options[o];
        }

        if (typeof this.options.el === 'string') {
            this.el = document.querySelector(this.options.el);
        } else if (this.options.el && 'innerHTML' in this.options.el) {
            this.el = this.options.el;
        }
        if (!this.el) {
            this.el = document.createElement('div');
        }
        this.el.innerHTML = this.template;

        this.els = {};
        for (var i = 0; i < this.elements.length; i+=1) {
            this.els[this.elements[i]] = this.el.querySelector('.pickfile-'+this.elements[i]);
        }
    }

    var PickFile = function(options) {
        this.init({
            datatype: 'Text',
            onLoad: function() {},
            onError: function() {}
        }, options);

        // file select
        this.els.fileselect.addEventListener("change", this.onFileSelect.bind(this), false);

        // load URL
        this.els.loadbtn.addEventListener("click", this.onLoadbtnClick.bind(this), false);

        // is XHR2 available?
        this.xhr = new XMLHttpRequest();
        if (this.xhr.upload) {
            // file drop
            this.els.filedrop.addEventListener("dragover", this.onFiledropHover.bind(this), false);
            this.els.filedrop.addEventListener("dragleave", this.onFiledropHover.bind(this), false);
            this.els.filedrop.addEventListener("drop", this.onFileSelect.bind(this), false);
        } else {
            this.els.filedrop.style.display = "none";
        }
    };

    PickFile.prototype = {
        elements: ['fileselect', 'filedrop', 'loadbtn', 'url'],
        template: '<div class="pickfile"><form><input class="pickfile-url" type="text" placeholder="type or paste remote URL here"><button class="pickfile-loadbtn btn btn-primary">Load</button><div class="pickfile-filedrop">or Drop file here</div><div class="pickfile-fileinputs btn btn-primary"><input class="pickfile-fileselect" type="file">or Choose file</div></form></div>',
        onFiledropHover: function (e) {
            e.stopPropagation();
            e.preventDefault();
            e.target.className = (e.type == "dragover" ? "hover " : "") + e.target.className.replace('hover ', '');
        },
        onFileSelect: function (e) {
            // cancel event
            this.onFiledropHover(e);

            var files = e.target.files || e.dataTransfer.files;
            for (var i = 0, f; (f = files[i]); i++) {
                this.parseFile(f);
            }
        },
        onLoadbtnClick: function(e) {
            e.preventDefault();
            var xhr = new XMLHttpRequest(),
                val = this.els.url.value;
            if (!val) {
                return;
            }
            xhr.onreadystatechange = function(e) {
                if (xhr.readyState == 4) {
                    if (xhr.status == 200) {
                        xhr.url = val;
                        this.options.onLoad(xhr.response, xhr);
                    } else {
                        this.options.onError(xhr.statusText, xhr);
                    }
                }
            }.bind(this);
            xhr.open("GET", this.els.url.value, true);
            xhr.responseType = this.options.datatype === 'BinaryString' ? 'blob' : this.options.datatype.toLowerCase();
            xhr.send();
        },
        init: init,
        parseFile: function (file) {
            var method = 'readAs' + this.options.datatype,
                reader = new FileReader();
            if (method in reader) {
                reader.onload = function(e) {
                    this.options.onLoad(e.target.result, file);
                }.bind(this);
                reader[method](file);
            }
        }
    };

    PickFile.Downloader = function(options) {
        this.init({
            filename: 'myfile.txt',
            placeholder: 'filename.txt',
            type: 'text/plain',
            content: ''
        }, options);

        this.els.filename.placeholder = this.options.placeholder;
        this.els.filename.value = this.options.filename || '';

        this.els.savebtn.addEventListener("click", this.onDownload.bind(this), false);
    };

    PickFile.Downloader.prototype = {
        elements: ['filename', 'savebtn', 'download'],
        template: '<div class="pickfile"><input type="text" class="pickfile-filename"><button class="btn btn-primary pickfile-savebtn">Save file</button><output class="pickfile-download"></output></div>',
        init: init,
        onDownload: function() {
            if (this.options.getFile) {
                this.options.getFile(this.downloadFile.bind(this));
            } else if (this.options.getContent) {
                this.options.getContent(function(content) {
                    this.downloadFile({
                        content: content
                    });
                }.bind(this));
            } else {
                this.downloadFile({});
            }
        },
        downloadFile: function(file) {
            file.type = file.type || this.options.type;
            file.filename = file.filename || this.els.filename.value || this.options.filename;
            file.content = file.content || this.options.content;

            window.URL = window.webkitURL || window.URL;

            var prevLink = this.els.download.querySelector('a');
            if (prevLink) {
                window.URL.revokeObjectURL(prevLink.href);
                this.els.download.innerHTML = '';
            }

            var bb = new Blob([file.content], {type: file.type});

            var a = document.createElement('a');
            a.download = file.filename;
            a.href = window.URL.createObjectURL(bb);
            a.textContent = 'Download';

            a.dataset.downloadurl = [file.type, a.download, a.href].join(':');

            this.els.download.appendChild(a);

            var self = this;
            a.onclick = function(e) {
                if ('disabled' in this.dataset) {
                  return false;
                }

                self.cleanUp(this);
            };
        },
        cleanUp: function(a) {
            a.textContent = 'Downloaded';
            a.dataset.disabled = true;

            // Need a small delay for the revokeObjectURL to work properly.
            setTimeout(function() {
               window.URL.revokeObjectURL(a.href);
            }, 1500);
        }
    };

    return PickFile;
});
