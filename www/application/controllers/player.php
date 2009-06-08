<?php

class Player extends Controller {

	function __construct() {
		parent::Controller();

		$this->load->helper('download');
		$this->load->helper('file');
		
		$this->load->model('Screen_model', 'screen');
		$this->load->model('Log_model', 'log');

		//$this->output->enable_profiler(TRUE);      

	}

	        
	function get_list($screen_md5 = null, $player_md5 = null) {
		
		$data = $this->screen->get_one_by_md5($screen_md5);
		$message = 'OK';
		
		if($data['id']) {
			$dir = DIR_FTP_SCREENS .'/'. $data['id'] .'/';

			if(is_array(get_filenames($dir))) {
				foreach(get_filenames($dir) as $file) {
					echo $file .';'. md5_file($dir.$file) .';'. filesize($dir.$file) ."\n";
				}
			} else {
				echo $message = 'ERROR - No Files';
			}
		} else {
			echo $message = 'ERROR - No Screen';
		}
		
		$this->log->write('player_get_list', $data['id'], $message);
		$this->screen->update_last_seen($data['id']);

	}



	function get_file($screen_md5 = null, $player_md5 = null, $file = null) {

		$data = $this->screen->get_one_by_md5($screen_md5);
		$message = 'OK';
		
		if($data['id']) {
			$dir = DIR_FTP_SCREENS .'/'. $data['id'] .'/';
			$file = str_replace('/', '', $file);

			//if(read_file($dir.$file)) {
				force_download($file, file_get_contents($dir.$file));		
			//} else {
			//	echo $message = 'ERROR - No File';
			//}
		} else {
			echo $message = 'ERROR - No Screen';
		}	

		$this->log->write('player_get_file', $data['id'], $message);
		$this->screen->update_last_seen($data['id']);
		
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



	function get_player_md5_list() {

		$data = $this->screen->get_list();

		foreach($data as $row) {
			echo $row['screen_md5'] ."\n";
		}

	}



}

?>
