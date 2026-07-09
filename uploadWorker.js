// Listen for messages from the main thread
self.onmessage = event => {
    const chunk = event.data;
    console.log(chunk);


    // Simulate uploading
    uploadChunk(chunk);
};

function uploadChunk(blob) {
    const CHUNKSIZE = 1024 * 1024 * 8;
    // 4MB chunk sizes.

    const SIZE = blob.chunk.size;
    const CHUNKS = Math.ceil(SIZE/CHUNKSIZE);

    var start = 0;
    var end = CHUNKSIZE;

    var firstChunk = blob.firstChunk;
    var lastChunk = blob.lastChunk;

    while (start < SIZE) {
        

        var fileChunk = blob.chunk.slice(start, end);
        console.log(fileChunk)

        var formData = new FormData;

        formData.append('chunk', firstChunk);
        formData.append('lastchunk', lastChunk);
        formData.append('totalchunks',blob.totalchunks);
        formData.append('name', blob.name);
        formData.append('srvrname', blob.srvrname);
        
        // Add file and send it
        formData.append('file', fileChunk);
       
        upload(formData);

        start = end;
        end = start + CHUNKSIZE;

        firstChunk++;
    }
    self.postMessage(blob.name + " Uploaded Succesfully");
}

    
    
function upload(blobOrFile) {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/uploadfile.rd', false);
    xhr.onload = function(e) {
    };
    xhr.send(blobOrFile);
}


