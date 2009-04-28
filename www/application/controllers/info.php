<?php

class Info extends Controller {

	function __construct() {
		parent::Controller();

		//$this->output->enable_profiler(TRUE);      

	}

	function index() {

		$view['page_menu_code'] = 'info';
		$view['page_content'] = $this->load->view('info/info_en', $view, True);
		$view['box']['contact']['content'] = $this->load->view('info/contact_en', $view, True);
		$this->load->view('main_page_view', $view);

	}

}	
	
?>
