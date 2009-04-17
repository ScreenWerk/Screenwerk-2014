<?php

class Player extends Controller {

	function __construct() {
		parent::Controller();

		$this->load->model('Screen_model', 'screen');

		//$this->output->enable_profiler(TRUE);      

	}

	        
	function get_list($screen_md5 = null, $player_md5 = null, $content_md5 = null) {
		
		$this->load->helper('file');

		$data = $this->screen->get_one_by_md5($screen_md5);
		
		if($data['id']) {
			$dir = DIR_FTP_SCREENS .'/'. $data['id'] .'/';

			if($content_md5 != $data['content_md5']) {
				if(is_array(get_filenames($dir))) {
					foreach(get_filenames($dir) as $file) {
						echo $file .';'. md5_file($dir.$file) .';'. filesize($dir.$file) ."\n";
					}
				} else {
					echo 'ERROR - No Files';
				} 
			} else {
				echo $data['content_md5'];
			}
		} else {
			echo 'ERROR - No Screen';
		}	
		
	}



	function get_file($screen_md5 = null, $player_md5 = null, $content_md5 = null, $file = null) {

		$this->load->helper('download');
		
		$dir = DIR_FTP_SCREENS .'/36/';
		$file = '5.VIDEO';
		
		force_download($file, file_get_contents($dir.$file));


	}	



	function confirm_download($screen_md5 = null, $player_md5 = null, $content_md5 = null) {
		echo $content_md5;
	}	
	
}

?>
