M.local_iproctoring = {
      fixlayout: function(Y, coursefullname){
	 try {
            console.log('Courese Name:', coursefullname);
	    document.getElementById('sitetitle').innerText = coursefullname;
	 } catch(e) {
	    console.log(e);
	 }
      },
      init: function(Y, quizid, courseid, sesskey, faceapi_models) {
	 const video = document.getElementById('myVideo');
         const mediaSource = new MediaSource();
         const canvasDom = document.getElementById('videoBody');

         try {
           console.log('Quiz ID:', quizid);
	   console.log('Course ID:', courseid);
           console.log('Session Key:', sesskey);
           console.log('Models:', faceapi_models);
           Promise.all([
	          faceapi.nets.tinyFaceDetector.loadFromUri(faceapi_models),
	          faceapi.nets.faceLandmark68Net.loadFromUri(faceapi_models),
	          faceapi.nets.faceRecognitionNet.loadFromUri(faceapi_models),
	          faceapi.nets.faceExpressionNet.loadFromUri(faceapi_models)
           ]).then(startVideo);

           function startVideo() {
	        var isFirefox = typeof InstallTrigger !== 'undefined';
	        navigator.getUserMedia( { video: {} },
	             startRecording,
	             err => console.error(err)
	        );
	   }
	   mediaSource.addEventListener('sourceopen', handleSourceOpen, false);
           let mediaRecorder;
	   let recordedBlobs;
	   let sourceBuffer;
	   function handleSourceOpen(event) {
	        console.log('MediaSource opened');
	        sourceBuffer = mediaSource.addSourceBuffer('video/webm; codecs="vp8"');
	        console.log('Source buffer: ', sourceBuffer);
	   }
   	   function handleDataAvailable(event) {
	        if (event.data && event.data.size > 0) {
	             recordedBlobs.push(event.data);
	        }
	   }
           function handleStop(event) {
	         console.log('Recorder stopped: ', event);
	         const superBuffer = new Blob(recordedBlobs, {type: 'video/webm'});
	         video.src = window.URL.createObjectURL(superBuffer);
	   }

           function startRecording(stream) {
	        let options = {mimeType: 'video/webm'};
  	        recordedBlobs = [];
  	        video.srcObject = stream;
	        try {
		     mediaRecorder = new MediaRecorder(stream, options);
                } catch (e0) {
		     console.log('Unable to create MediaRecorder with options Object: ', e0);
		     try {
		          options = {mimeType: 'video/webm,codecs=vp9'};
		          mediaRecorder = new MediaRecorder(stream, options);
		     } catch (e1) {
		          console.log('Unable to create MediaRecorder with options Object: ', e1);
		          try {
		               options = 'video/vp8';
		               mediaRecorder = new MediaRecorder(stream, options);
		          } catch (e2) {
		               alert('MediaRecorder is not supported by this browser.\n\n' +
		                     'Try Firefox 29 or later, or Chrome 47 or later, ' +
		                     'with Enable experimental Web Platform features enabled from chrome://flags.');
			       console.error('Exception while creating MediaRecorder:', e2);
			         return;
	                   }
	            }
	       }
	       console.log('Created MediaRecorder', mediaRecorder, 'with options', options);
	       mediaRecorder.onstop = handleStop;
	       mediaRecorder.ondataavailable = handleDataAvailable;
	       mediaRecorder.start(100);
	       console.log('MediaRecorder started', mediaRecorder);
	   }

           video.addEventListener('play', () => {
	        const canvas = faceapi.createCanvasFromMedia(video);
	        canvasDom.append(canvas);
	        const displaySize = { width: video.width, height: video.height }
	        faceapi.matchDimensions(canvas, displaySize);
	        setInterval(async () => {
	             const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions();
	             const resizedDetections = faceapi.resizeResults(detections, displaySize);
	             canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
	             faceapi.draw.drawDetections(canvas, resizedDetections);
	             if(detections.length > 1){
	                 uploadVideo()
                     }
               }, 100);
	   });
   	   function uploadVideo(){
	        let formData = new FormData();
	        const blob = new Blob(recordedBlobs, {type: 'video/webm'});
	        formData.append('audioVideo', blob);
                formData.append('quizId', quizid);
	        formData.append('courseId', courseid);
	        formData.append('sessKey', sesskey);
	        xhr('/uvle351/local/iproctoring/server/upload-video.php', formData, function () {
	             console.log("Video succesfully uploaded !");
	        });
	        function xhr(url, data, callback) {
	             var request = new XMLHttpRequest();
	             request.onreadystatechange = function () {
	                  if (request.readyState == 4 && request.status == 200) {
	                       callback(location.href + request.responseText);
	                  }
	             };
	        request.open('POST', url);
	        request.send(data);
                }
	   }

/*          player.on('finishRecord', function() {
	     console.log('Finish Record');
	           console.log('Last Modified date:', player.recordedData.lastModifiedDate);
   	           console.log('File Size:', player.recordedData.size);
	           console.log('Video Binary:', player.recordedData.video);
                   let formData = new FormData();
                   formData.append('audioVideo', player.recordedData);
	           formData.append('quizId', quizid);
	           formData.append('courseId', courseid);
	           formData.append('sessKey', sesskey);
	           xhr('/uvle351/local/iproctoring/server/upload-video.php', formData, function (fName) {
	                console.log("Video succesfully uploaded !");
		        $('#user-notifications').html('');
		        $('#user-notifications').append('<div class="alert alert-success alert-block fade in " role="alert">'+
			                       '<button type="button" class="close" data-dismiss="alert">×</button>'+
			                       'Successfully Uploaded!'+
			                   '</div>');
                   });
                   function xhr(url, data, callback) {
	                var request = new XMLHttpRequest();
	                request.onreadystatechange = function () {
	                     if (request.readyState == 4 && request.status == 200) {
	                           callback(location.href + request.responseText);
	                     }
	                };
	                request.open('POST', url);
	                request.send(data);
	           }
          });*/
       } catch(e){
           console.log(e);
       }
     }, 
     datatable: function(Y, sesskey){
	  $.noConflict();
          var table = $('#iProctoringTable').DataTable({
               dom: 'lfrtip',
               order:[[6, "desc"]],
               searching: true,
               scrollX: true,
               fixedColumns: true,
               fixedHeader: true,
               buttons: ['csvHtml5']
          });
          $('button.ipDelete').on('click', function(){
	       console.log('Delete SessionKey: ', sesskey);
	       let deleteStatus = confirm("Are you sure to delete this record?");
               if(deleteStatus){
		    let id = $(this).data('deleteid');
	            $.ajax({
			 url:'/uvle351/local/iproctoring/server/delete-review.php',
			 method: 'POST',
			 data: {
			      id: id,
			      sessKey: sesskey
			 }
	            }).done(function(datas){
			 let data = JSON.parse(datas);
			 if(data.code == 0){
			      $('.notifications').append('<div class="alert alert-success alert-block fade in " role="alert">'+
			           '<button type="button" class="close" data-dismiss="alert">×</button>'+data.message+'</div>');
			 }
			 if(data.code == 1){
			      $('.notifications').append('<div class="alert alert-danger alert-block fade in " role="alert">'+
			           '<button type="button" class="close" data-dismiss="alert">×</button>'+data.message+'</div>');
			 }
			if(data.code == 2){
			      $('.notifications').append('<div class="alert alert-warning alert-block fade in " role="alert">'+
			           '<button type="button" class="close" data-dismiss="alert">×</button>'+data.message+'</div>');
			 }
 			 setTimeout(function(){
			      location.reload(true); 
			 }, 2000);
		    });
	       } else {
	            console.log('Does not proceed!');
	       }
	   });

           $('button.ipView').on('click', function(){
                $('div.ipModal').show();
                $('.ipNote').hide();
                $('.ipSubmitNote').hide();
                if($(this).data('videolink')!=''){
                     $('#my-player').attr('src',$(this).data('videolink'));
		     $('#ipAddNote').val($(this).data('reviewstat'));
		     $('#ipId').val($(this).data('viewid'));
                } else {
                     $('#my-player').attr('src','');
		     $('#ipAddNote').val('');
		     $('#ipId').val('');
                }
		if($(this).data('reviewstat') == 1){
		     $('.ipAddNote').prop('checked', true);
		     $('.ipNote').show();
		     $('.ipSubmitNote').show();
		} else {
		     $('.ipAddNote').prop('checked', false);
		     $('.ipNote').hide();
		     $('.ipSubmitNote').hide();
		}
		$('.ipNote').val('');
		$('.ipNote').val($(this).data('note'));
           });

           $('span.ipClose').on('click',function(){
                $('div.ipModal').hide();
                $('#my-player').trigger('pause');
           });
           $('.ipAddNote').click(function(){
                if(!this.checked) {
                     $('.ipNote').hide();
                     $('.ipSubmitNote').hide();
		     $(this).val(0);
                } else {
                     $('.ipNote').show();
                     $('.ipSubmitNote').show();
		     $(this).val(1);
                }
           });
	   $('.ipSubmitNote').click(function(){
	        $.ajax({
		     url:'/uvle351/local/iproctoring/server/update-review.php',
		     method:'POST',
		     data:{
			  sessKey: sesskey,
			  id: $('#ipId').val(),
			  reviewStat: $('#ipAddNote').val(),
		          textNote: $('#ipNote').val()
		     }
		}).done(function(datas){
			 let data = JSON.parse(datas);
   		         $('div.ipModal').hide();
                         $('#my-player').trigger('pause');
		         if(data.code == 0){
			      $('.notifications').append('<div class="alert alert-success alert-block fade in " role="alert">'+
			           '<button type="button" class="close" data-dismiss="alert">×</button>'+data.message+'</div>');
			 }
			 if(data.code == 1){
			      $('.notifications').append('<div class="alert alert-danger alert-block fade in " role="alert">'+
			           '<button type="button" class="close" data-dismiss="alert">×</button>'+data.message+'</div>');
			 }
			 if(data.code == 2){
			      $('.notifications').append('<div class="alert alert-warning alert-block fade in " role="alert">'+
			           '<button type="button" class="close" data-dismiss="alert">×</button>'+data.message+'</div>');
			 }
			 setTimeout(function(){
			      location.reload(true); 
			 }, 2000);
		});
	   });
           $('button.ipSearchFilter').on('click', function(){
                $('div.ipSearchModal').show();
           });
           $('span.ipSearchClose').on('click',function(){
                $('div.ipSearchModal').hide();
          });
          $('#iProctoringTable thead tr:eq(0) th').each( function (i) {
                var title = $(this).text();
                $('div.ipSearchInputs').append( '<input type="text" placeholder="Search '+title+'" />' );
                $( 'div.ipSearchInputs input' ).on( 'input', function (e) {
                     if ( table.column(i).search() !== this.value ) {
                          table.column(i).search( this.value ).draw(false);
                     }
                     table.fnFilterClear();
                } );
          } );
     }//datatable
} //end
$(document).ready(function(){
     $('#ipSetname').click(function(){
          $('#ipSetname').hide();
	  $('#ipUnsetname').show();
          $('#ipFilename').attr('readonly', true);
     });
     $('#ipUnsetname').click(function(){
          $('#ipUnsetname').hide();
          $('#ipSetname').show();
          $('#ipFilename').attr('readonly', false);
     });
//Administration
     $('#administration').css('display','inline-block');
});

function startVideo() {
     navigator.getUserMedia( { video: {} },
          startRecording,
          err => console.error(err)
     );
}

