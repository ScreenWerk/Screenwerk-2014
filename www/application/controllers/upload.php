<?php

class Upload extends Controller {

	function __construct() {
		parent::Controller();

		//$this->output->enable_profiler(TRUE);      

	}
	        
	function index() {

		$view['page_menu_code'] = 'upload';
		$view['page_content'] = $this->load->view('upload_view', $view, True);
		$this->load->view('main_page_view', $view);

	}



	function do_upload() {
		
		$config['upload_path'] = '../ftp/incoming/';
		$config['allowed_types'] = 'image|video|text';
		$config['remove_spaces'] = TRUE;
		
		$this->load->library('upload', $config);
	
		if ( ! $this->upload->do_upload('upload_file')) {
			$view['error'] = $this->upload->display_errors();
		} else {
			$view['data'] = $this->upload->data();
		}

		$view['page_menu_code'] = 'upload';
		$view['page_content'] = $this->load->view('upload_view', $view, True);
		$this->load->view('main_page_view', $view);

	}	
	
}

?>
