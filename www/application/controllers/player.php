<?php

class Player extends Controller {

	function __construct() {
		parent::Controller();

		//$this->output->enable_profiler(TRUE);      

	}

	        
	function get_list($customer_md5 = null, $player_md5 = null, $content_md5 = null) {
		
		$this->load->helper('file');

		echo '<pre>';
		
		$dir = DIR_FTP_SCREENS .'/36/';

		if($content_md5 != 'VANA') {
		} else {
			echo 'VANA';
		}
		
		foreach(get_filenames($dir) as $file) {
			echo $file .';'. md5_file($dir.$file) .';'. filesize($dir.$file) ."\n";
		}
		
	}



	function get_file($customer_md5 = null, $player_md5 = null, $content_md5 = null, $file = null) {

		$this->load->helper('download');
		
		$dir = DIR_FTP_SCREENS .'/36/';
		$file = '5.VIDEO';
		
		force_download($file, file_get_contents($dir.$file));


	}	



	function confirm_download($customer_md5 = null, $player_md5 = null, $content_md5 = null) {
		echo $content_md5;
	}	
	
}

?>
