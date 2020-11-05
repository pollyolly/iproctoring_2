<?php

defined('MOODLE_INTERNAL') || die;

class local_iproctoring_renderer extends plugin_renderer_base {

     public function add_iproctoring_js_modules(){
          global $PAGE, $USER, $DB;
	  $cm = $PAGE->cm;
	  $quiz = $DB->get_record('quiz', array('id' => $cm->instance));
	  /*$PAGE->requires->js(new moodle_url($CFG->wwwroot .'/local/iproctoring/video7.min.js'), true);
	  $PAGE->requires->js(new moodle_url($CFG->wwwroot .'/local/iproctoring/RecordRTC.js'),true);
	  $PAGE->requires->js(new moodle_url($CFG->wwwroot .'/local/iproctoring/adapter.js'),true);
	  $PAGE->requires->js(new moodle_url($CFG->wwwroot .'/local/iproctoring/videojs.record.min.js'),true);
	  $PAGE->requires->js(new moodle_url($CFG->wwwroot .'/local/iproctoring/browser-workarounds.js'),true);*/
	  $PAGE->requires->js_init_call('M.local_iproctoring.init',
   	       array(
	           'quizid'=>$quiz->id,
		   'courseid'=>$PAGE->course->id,
		   'sesskey'=>sesskey(),
		   'faceapi_models'=> '../../local/iproctoring/face-api/models'
	       ),
	       array('require'=>new moodle_url($CFG->wwwroot .'/local/iproctoring/module.js')));
     }
     public function add_iproctoring_css_modules(){
          global $PAGE;
          /*$PAGE->requires->css(new moodle_url($CFG->wwwroot .'/local/iproctoring/video-js.min.css'),true);
	  $PAGE->requires->css(new moodle_url($CFG->wwwroot .'/local/iproctoring/videojs.record.min.css'),true);*/
     	  $PAGE->requires->css(new moodle_url($CFG->wwwroot .'/local/iproctoring/iproctoring.css'),true);
     }
     public function add_videojs_modules(){
          global $PAGE;
          /*$PAGE->requires->css(new moodle_url($CFG->wwwroot .'/local/iproctoring/video-js.min.css'),true);
	  $PAGE->requires->css(new moodle_url($CFG->wwwroot .'/local/iproctoring/videojs.record.min.css'),true);*/
     }
     public function add_faceapi_modules(){
          global $PAGE;
          $PAGE->requires->js(new moodle_url($CFG->wwwroot .'/local/iproctoring/face-api/face-api.min.js'),true);
     }
     public function add_datatable_modules($coursefullname){
	  global $PAGE, $DB;
	  $PAGE->requires->js(new moodle_url($CFG->wwwroot.'/local/iproctoring/datatable/datatables.min.js'),true);
	  $PAGE->requires->css(new moodle_url($CFG->wwwroot.'/local/iproctoring/datatable/datatables.min.css'));
	  $PAGE->requires->js_init_call('M.local_iproctoring.datatable',
   	       array(
		   'sesskey'=>sesskey()
	       ),
	       array('require'=>new moodle_url($CFG->wwwroot .'/local/iproctoring/module.js')));
	  $PAGE->requires->css(new moodle_url($CFG->wwwroot .'/local/iproctoring/dataTable.css'));
	  $PAGE->requires->js_init_call('M.local_iproctoring.fixlayout',
   	       array(
		   'coursefullname'=>$coursefullname
	       ),
	       array('require'=>new moodle_url($CFG->wwwroot .'/local/iproctoring/module.js')));
     }
     public function add_iproctoring_block($attemptid, $page, $cmid){
	  global $COURSE;
          $quiznav = new block_contents();
          $quiznav->skipid = 1;
          $quiznav->blockinstanceid = 0;
          $quiznav->blockpositionid = 0;
          $quiznav->attributes = array('class'=>'block','id'=>'mod_quiz_navblock','role'=>'navigation','aria-labelledby' => 'mod_quiz_navblock_title');
	  $quiznav->title = "Record video ";
	  $quiznav->arialabel = "";
	  $quiznav->content='
	  <div id="videoBody">
               <canvas></canvas>
               <video id="myVideo" width="250" height="180" autoplay></video>
          </div>';
          //$quiznav->content = "<video id='myVideo'></video>";
	  $quiznav->footer = "<a href='".new moodle_url('/local/iproctoring/view/report.php', array('id'=>$COURSE->id, 'attempt'=>$attemptid, 'cmid'=>$cmid, 'page'=>$page))."'>View Report</a>"; 
          $quiznav->annotation = "";
          $quiznav->collapsible =  0;
          $quiznav->dockable =  "";
          $quiznav->controls =  Array();
	  return $quiznav;
     }
}
