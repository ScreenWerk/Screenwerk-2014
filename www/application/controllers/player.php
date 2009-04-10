<?php

class Player extends Controller {

	function __construct() {
		parent::Controller();

		//$this->output->enable_profiler(TRUE);      

	}

	        
	function get_list($customer_md5 = null, $player_md5 = null, $content_md5 = null) {
		
		if($content_md5 != 'VANA') {
			echo 'file1.txt;'. md5('file1.txt') .';128' . "\n";
			echo 'file2.txt;'. md5('file2.txt') .';723645' . "\n";
			echo 'file3.txt;'. md5('file3.txt') .';51423' . "\n";
		} else {
			echo 'VANA';
		}
	}



	function get_file($customer_md5 = null, $player_md5 = null, $content_md5 = null, $file = null) {
		redirect('http://screenwerk.eu/screenwerk_files/sw-p.png');
	}	



	function confirm_download($customer_md5 = null, $player_md5 = null, $content_md5 = null) {
		echo $content_md5;
	}	
	
}

?>
