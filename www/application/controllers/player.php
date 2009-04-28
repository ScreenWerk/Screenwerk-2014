<?php

class Player extends Controller {

	function __construct() {
		parent::Controller();

		$this->load->helper('download');
		$this->load->helper('file');
		
		$this->load->model('Screen_model', 'screen');

		//$this->output->enable_profiler(TRUE);      

	}

	        
	function get_list($screen_md5 = null, $player_md5 = null, $content_md5 = null) {
		
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

		$data = $this->screen->get_one_by_md5($screen_md5);
		
		if($data['id']) {
			$dir = DIR_FTP_SCREENS .'/'. $data['id'] .'/';
			$file = str_replace('/', '', $file);

			if($content_md5 == $data['content_md5']) {
				if(read_file($dir.$file)) {
					force_download($file, file_get_contents($dir.$file));		
				} else {
					echo 'ERROR - No File';
				}
			} else {
				echo 'ERROR - No Content';
			}
		} else {
			echo 'ERROR - No Screen';
		}	

	}	



	function confirm_download($screen_md5 = null, $player_md5 = null, $content_md5 = null) {

		$data = $this->screen->get_one_by_md5($screen_md5);
		
		if($data['id']) {
			if($content_md5 == $data['content_md5']) {
				echo $data['content_md5'];
			} else {
				echo 'ERROR - No Content';
			}
		} else {
			echo 'ERROR - No Screen';
		}
	
	}	

	
	
	function download($version = null) {
		
		$dir = DIR_FTP_PLAYERS .'/';
		
		if($version) {
			$file = 'SWPlayer_'. $version .'.air';
		} else {
			$file = 'SWPlayer.air';
		}
		
		if(read_file($dir.$file)) {
			force_download($file, file_get_contents($dir.$file));		
		} else {
			show_404('player/download');
		}

	}
}

?>
