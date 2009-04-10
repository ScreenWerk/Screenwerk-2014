<?php

class Upload extends Controller {

	function __construct() {
		parent::Controller();

		//$this->output->enable_profiler(TRUE);      

	}

	function index() {

		$view['page_menu_code'] = 'upload';
		$view['upload_folder'] = DIR_FTP_INCOMING .'/'. $this->session->customer_id .'/';
		$view['page_content'] = $this->load->view('upload_view', $view, True);
		$this->load->view('main_page_view', $view);
		

	}

}	
	
?>
