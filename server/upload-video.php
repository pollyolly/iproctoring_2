<?php
require_once(dirname(__FILE__) . '/../../../config.php');
define('AJAX_SCRIPT', true);

require_login();

$uploadDir = dirname(__DIR__).'/../../iproctoring_upload/';
if(isset($_FILES["audioVideo"]) && isset($_POST['sessKey'])){
     if($_POST['sessKey'] === sesskey()){
          $courseId = $_POST['courseId'];
          $quizId = $_POST['quizId'];
          $userId = $USER->id;
          $randomFilename = md5(uniqid());
          $fileName = $randomFilename.'.mp4';
          $uploadDirectory = $uploadDir.$fileName;
          $fileSize = $_FILES["audioVideo"]["size"];
     // Move the file to your server
          if (!move_uploaded_file($_FILES["audioVideo"]["tmp_name"], $uploadDirectory)) {
               echo json_encode(array('code'=>1, 'message'=>"Could not upload a video !"));
          }
          else{
   	       $record = new stdClass();
  	       $record->course_id = $courseId;
	       $record->quiz_id = $quizId;
	       $record->user_id = $userId;
	       $record->file_link = $fileName;
	       $record->file_timestamp = time();
	       $record->file_size = $fileSize;
	       $DB->insert_record('local_iproctoring', $record);
               echo json_encode(array('code'=>0, 'message'=>"Video uploaded!"));
          }
     } else {
          echo json_encode(array('code'=>1, 'message'=>'Invalid session!'));
     }
} else {
     echo json_encode(array('code'=>1,'message'=>'Failed to upload!'));
}
