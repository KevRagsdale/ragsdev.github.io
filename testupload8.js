var files = [], p = true;

// Setup the dnd listeners.
const dropZone = document.getElementById('drop_zone');
dropZone.addEventListener('dragover', handleDragOver, false);
dropZone.addEventListener('drop', handleFileSelect, false);
document.getElementById('files').addEventListener('change', handleFileSelect, false);

function handleFileSelect(evt) {
    console.log(evt);

    evt.stopPropagation();
    evt.preventDefault();

    // var files = evt.dataTransfer.files||evt.target.files;
    // FileList object.

    files = Array.from(evt.currentTarget.files);

    console.log(files);
    console.log("Posting message...");


    //Sending File list to worker
    // files is a FileList of File objects. List some properties.
    var output = [];
    for (var i = 0, f; f = files[i]; i++) {
        output.push('<li><strong>', escape(f.name), '</strong> (', f.type || 'n/a', ') - ', f.size, ' bytes, last modified: ', f.lastModifiedDate ? f.lastModifiedDate.toLocaleDateString() : 'n/a', '</li>');
    }
    document.getElementById('list').innerHTML = '<ul>' + output.join('') + '</ul>';

    process();
}


function handleDragOver(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    evt.dataTransfer.dropEffect = 'copy';
    // Explicitly show this is a copy.
}


function process() {
    console.log("Processing!");
    console.log(files);
    for (var j = 0; j < files.length; j++) {
        let blob = { file: files[j], fileGuid: _getGuid(), fileName: files[j].name};
        console.log(blob);

        var blobChunks = splitFileIntoChunks(blob);
        console.log(blobChunks);

        // Create multiple web workers
        const numWorkers = blobChunks.length;
        const workers = [];
        for (let i = 0; i < numWorkers; i++) {
            const worker = new Worker('uploadWorker.js?v=1.05');
            workers.push(worker);
        }

        // Distribute chunks among workers
        blobChunks.forEach((chunk, index) => {
            const workerIndex = index % numWorkers;
            
            workers[workerIndex].postMessage(chunk);
        });

    };
}    


function splitFileIntoChunks(blob) {
    const FILESIZE = blob.file.size;

    // If the file is larger than 10MB, split it into 4 big "chunks"
    const FILECHUNKSIZE =((FILESIZE > (1024*1024) * 10) ? (FILESIZE/4) : FILESIZE);

    const FILECHUNKS = Math.ceil(FILESIZE/FILECHUNKSIZE);

    // Now lets split each "big" chunk into 8MB chunks...
    const CHUNKSIZE = 1024 * 1024 * 8;
    const TOTALCHUNKS = Math.ceil(FILESIZE/CHUNKSIZE);

    console.log(TOTALCHUNKS);

    var start = 1;

    const chunks = [];

    let fileOffset = 0;

    console.log(FILESIZE);
    console.log(FILECHUNKSIZE);
    console.log(FILECHUNKS);


    while (fileOffset < FILESIZE) {
        const chunk = blob.file.slice(fileOffset, fileOffset + FILECHUNKSIZE);

        const SIZE = chunk.size;
        const CHUNKS = Math.ceil(SIZE/CHUNKSIZE);

        console.log(CHUNKS);

        let chunkData = { chunk: chunk, firstChunk: start, lastChunk: start+CHUNKS-1, name: blob.fileName, srvrname: blob.fileGuid, chunks: CHUNKS, totalchunks: TOTALCHUNKS};
        console.log(chunkData);

        start = chunkData.lastChunk + 1;


        chunks.push(chunkData);
        fileOffset += FILECHUNKSIZE;

    }

    let totalChunks = chunks.reduce((n, {chunks}) => n + chunks, 0);
    chunks.forEach((x) => x.totalchunks = totalChunks);


    console.log(chunks);
    return chunks;
}



function _getGuid() {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}


/*
function upload(blobOrFile) {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/uploadfile.zapi', false);
    xhr.onload = function(e) {
    };
    xhr.send(blobOrFile);
}



// Assuming you have a function to split file into chunks
const chunks = splitFileIntoChunks(file);

// Create multiple web workers
const numWorkers = 3;
const workers = [];
for (let i = 0; i < numWorkers; i++) {
    const worker = new Worker('uploadWorker.js');
    workers.push(worker);
}

// Distribute chunks among workers
chunks.forEach((chunk, index) => {
    const workerIndex = index % numWorkers;
    workers[workerIndex].postMessage({ chunk });
});

// Handle responses from workers
workers.forEach(worker => {
    worker.onmessage = event => {
        const { status, message } = event.data;
        console.log(`Received status ${status} from worker: ${message}`);
        // Handle response from worker
    };

    worker.onerror = error => {
        console.error(`Error in worker: ${error.message}`);
        // Handle error from worker
    };
});
*/




